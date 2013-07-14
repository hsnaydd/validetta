/*!
 * snValidate - jQuery Eklentisi
 * version: 1.0 (30 Mart 2013, Cumartesi)
 * @jQuery v1.7 ve üstü ile çalışmaktadır.
 *
 * Örneklere http://... adresinden  ulaşabilirsiniz.
 * Proje Adresi : https://github.com/hsnayd/hsnValidate 
 * Lisans: MIT ve GPL
 *  * http://www.opensource.org/licenses/mit-license.php
 *  * http://www.gnu.org/licenses/gpl.txt
 *
 * Copyright 2012 Hasan Aydoğdu - http://www.hasanaydogdu.com
 *
 */
(function($){
    "use strict";
    // Declare variables
    var HsnValidate = {}; // Plugin Class 
    var object = {}; // Current object/objects
    // RegExp for input validate rules
    var reg = new RegExp(/(minChecked|maxChecked|minSelected|maxSelected|minLength|maxLength|equal|custom)\[(\w){1,10}\]/i);
    // RegExp for mail kontrol method
    var regMail = new RegExp(/^[a-z]{1}[\d\w\.-]+@[\d\w-]{3,}\.[\w]{2,3}(\.\w{2})?$/);
    //RegExp for input number control method
    var regNumber = new RegExp(/^[\+][0-9]+?$|^[0-9]+?$/);
    /**
    * Form kontrol hata mesajları 
    * @Object messages
    * @type {Object}
    */
    var messages = {
        empty   : 'This field is required. Please be sure to check.',
        email   : 'Your E-mail address appears to be invalid. Please be sure to check.',
        number    : 'You can only enter numbers in this field.',
        maxLength : 'Maximum {count} characters allowed!',
        minLength : 'Minimum {count} characters allowed! ',
        checkbox  : 'This checkbox is required. Please be sure to check.',
        maxChecked  : 'Maximum {count} options allowed. Please be sure to check.',
        minChecked  : 'Please select minimum {count} options.',
        selectbox : 'Please select an option.',
        maxSelected : 'Maximum {count} selection allowed. Please be sure to check.',
        minSelected : 'Minimum {count} selection allowed. Please be sure to check.',
        notEqual  : 'Fields do not match. Please be sure to check.',
        creditCard  : 'Invalid credit card number. Please be sure to check.'
    };
    /**
    * Eklenti default ayarları
    * 
    * @type {Object} defaults
    */
    var defaults = {
        /**
        * errorClass description
        *
        * @propertyName errorClass
        * @default : 'formHataKapa'
        */
        errorClass    : 'formHata',
        errorCloseClass : 'formHataKapa',
        ajax : {
          call    : false,
          type    : 'GET',
          url     : null,
          dataType  : 'html',
          beforeSend  : $.noop,
          success   : $.noop,
          fail    : $.noop,
          complete  : $.noop
        },
        blurTrigger   : true,
        onCompleteFunc  : $.noop,
        customReg   : {}  
    };
    /**
    * Plugin Class
    * @classDescription : Form validator
    * @param {object} form : Kontrol edilen form elementi
    * @param {object} options : Kullanıcının belirlediği ayarlar
    * @return {object}
    */
    HsnValidate = function(form,options){
        /*!
        * @param handler : uses for handle submit
        * @param object : current element
        * @private
        */
        this.handler = false;
        this.options = $.extend(true,{},defaults,options);
        this.form = form ;
        this.events.call(this,arguments);
    };
    /**
    * Events
    * handle submit, change ve checkbox click events
    * 
    * @return {Void}
    */
    HsnValidate.prototype.events = function(){
        // define private 'that' for sub functions
        var that = this;
        $(this.form).submit(function(e){
            //e.preventDefault();
            object = $(this).find('[data-hsnValidate]');
            that.init.call(that,e);
        });
        if(this.options.blurTrigger){
            // handle change event for form elements (without checkbox)
            $(this.form).find('[data-hsnValidate]').not('[type=checkbox]').on('change',function(e){
                object = this;
                that.init.call(that,e);
            });
            // handle click event for checkboxes
            $(this.form).find('[data-hsnValidate][type=checkbox]').on('click',function(e){
                var name = $(this).attr('name');
                object = $(that.form).find('[data-hsnValidate][type=checkbox][name='+name+']').get(0);
                that.init.call(that,e);
            });
        }
        // Reset Buton clicked
        $(this.form).find('input[type=reset]').on('click',function(){
            var _inp = $(that.form).find('.'+that.options.errorClass);
            that.reset.call(that,_inp);
        });
        //Manuel Hata Kapatma
        $(this.form).on('click','.'+this.options.errorCloseClass, function(){
            $(this).parent().remove();
                return false;
        });
    };
    /**
    * İnput reset function
    * @param {String} _inp 
    */
    HsnValidate.prototype.reset = function(_inp){
        var that = this;
        _inp.each(function(index, el) {
            that.window.close.call(that,el);
        }); 
    };
    /**
    * Init Function
    * @method : this.init();
    * @params {Object} e : event object
    * @return {Function} or {Boolen}
    */
    HsnValidate.prototype.init = function(e){
        // this is stored in that for sub fuctions
        var that = this;
        // Reset errors props from all elements 
        this.reset.call(this,$(object));
        // Start control each elements
        $(object).each(function(i, element){
            /**
            * Declaring variables
            * 
            * @params {object} _el : current element
            * @params {string} _errors : current element's errors
            * @params {string} _val : current element's value
            * @params {object} _methods : current elemenet's kontrol methods 
            */
            var _el, _errors, _val = {}, _methods = {}; 
            _el = element;
            _errors ='';
            _val = $(_el).val();
            _methods = $(_el).data('hsnvalidate').split(',');
            $(_methods).each(function(i, method) {
                if(method === 'required'){
                    if($(_el).attr('type')==='checkbox' && !that.check.checkbox.checked(_el)){ _errors += messages.checkbox+'<br />'; }
                    else if(_el.tagName ==='SELECT' && !that.check.selectbox.selected(_val)){ _errors += messages.selectbox+'<br />'; }
                    if(($(_el).attr('type') ==='text' || _el.tagName ==='TEXTAREA') && !that.check.space.call(that,_val)){ _errors += messages.empty+'<br />'; }  
                }
                if(method === 'number' && !that.check.number(_val)){
                    _errors += messages.number+'<br />';
                }
                if(method === 'email' && !that.check.mail(_val)){
                    _errors += messages.email+'<br />';
                }
                if(method === 'creditCard' && _val!=='' && !that.check.creditCard(_val)){
                    _errors += messages.creditCard+'<br />';
                }
                if(reg.test(method)){
                    var rules,_name;
                    rules = method.split(/\[|,|\]/);
                    if(rules[0] === 'maxLength' && !that.check.maxLength(_val,rules[1])){
                        _errors += messages.maxLength.replace('{count}',rules[1])+'<br />';
                    }else if(rules[0] === 'minLength' && !that.check.minLength(_val,rules[1])){
                        _errors += messages.minLength.replace('{count}',rules[1])+'<br />';
                    }else if(rules[0] === 'maxChecked' && !that.check.checkbox.maxChecked.call(that,_el,rules[1])){
                        _name = $(_el).attr('name');
                        _el = $(object).filter('[type=checkbox][name='+_name+']').eq(0);
                        _errors += messages.maxChecked.replace('{count}',rules[1])+'<br />';
                    }else if(rules[0] === 'minChecked' && !that.check.checkbox.minChecked.call(that,_el,rules[1]) ){
                        _name = $(_el).attr('name');
                        _el = $(object).filter('[type=checkbox][name='+_name+']').eq(0);
                        _errors += messages.minChecked.replace('{count}',rules[1])+'<br />';
                    }else if(rules[0] === 'maxSelected' && !that.check.selectbox.maxSelected(_val,rules[1])){
                        _errors += messages.maxSelected.replace('{count}',rules[1])+'<br />';
                    }else if(rules[0] === 'minSelected' && !that.check.selectbox.minSelected(_val,rules[1])){
                        _errors += messages.minSelected.replace('{count}',rules[1])+'<br />';
                    }else if(rules[0] === 'equal' && !that.check.equal.call(that,_val,rules[1])){
                        _errors += messages.notEqual+'<br />';
                    }else if(rules[0] === 'custom' && !that.check.customReg(_val,that.options.customReg[rules[1]].method)){
                        _errors += (that.options.customReg[rules[1]].errorMessage || messages.empty)+'<br />';
                    }
                }
            });
            if(_errors !== ''){ that.window.open.call( that ,_el,_errors); }
        });
        if(that.handler && e.type !== 'submit'){return false; }
        else if(that.handler && e.type === 'submit'){return e.preventDefault();}
        else{
        /*if(that.options.onCompleteFunc){
          that.options.onCompleteFunc()
          return false;
        }else{return;}*/
            if(that.options.ajax.call){
                that.ajax.call(that,arguments);
                return e.preventDefault(); 
            }
            return;
        }
    };
    /**
    * Clear - İnput değerinin sağ ve solundaki boşlukları temizler
    *
    * @param {string} value
    * @return {String} 
    */
    HsnValidate.prototype.clear = function(value){
      return value.replace(/^\s+|\s+$/g, '');
    };
    /**
    * Validator functions
    * @param {String} Val : input value
    */
    HsnValidate.prototype.check = {
        /**
        * Boşluk Kontrolü - gelen değerin boş olup olmadığını kontrol eder
        * @return {Boolen} Return true if input value isnt empty 
        *
        */
        space : function(val){
            return (this.clear(val) === '') ? false : true;
        },
        /**
        * Mail Kontrolü - Gelen değerin geçerli bir eposta adresi olup olmadığını kontrol eder
        *
        * @return {Boolen} input değeri geçersiz bir eposta ise ve input değeri boş değilse false döner
        */
        mail : function(val){
            return ((regMail.test(val) === false) && val!=='') ? false : true ;
        },
        //Numara Kontrolu
        number : function(val){
            return ((regNumber.test(val) === false) && val!=='') ?  false : true;
        },
        //Minimum uzunluk kontrol
        minLength : function(val,arg){
            var _length = val.length;
            return ( _length < arg && _length !== 0) ? false : true;
        },
        //Max uzunluk kontrol
        maxLength : function(val,arg){
            return (val.length > arg) ? false : true;
        },
        //Equal Control
        equal : function(val,arg){
            return ($(this.form).find('input[type=text][name='+arg+']').val() !== val) ? false : true;
        },
        /*  Credit Card Control
        *
        * @from : http://af-design.com/blog/2010/08/18/validating-credit-card-numbers 
        * @return {Boolen} 
        */
        creditCard : function(val){
            var reg, cardNumber, pos, digit, i, sub_total, sum = 0, strlen;
            reg = new RegExp(/[^0-9]+/g);
            cardNumber = val.replace(reg,'');
            strlen = cardNumber.length;
            if(strlen < 16){return false;}
            for(i=0;i<strlen;i++){
                pos = strlen - i;
                digit = parseInt(cardNumber.substring(pos - 1, pos), 10);
                if(i % 2 === 1){
                    sub_total = digit * 2;
                    if(sub_total > 9){
                        sub_total = 1 + (sub_total - 10);
                    }
                } else {
                    sub_total = digit;
                }
                sum += sub_total;
            }
            if(sum > 0 && sum % 10 === 0){
                return true;
            }
            return false;
        },
        //Checkbox Kontrolu
        checkbox : {
            checked : function(_inp){
                return (!$(_inp).is(':checked')) ? false : true;
            },
            maxChecked : function(_inp,arg){  
                var name = $(_inp).attr('name'),
                count = $(this.form).find('input[type="checkbox"][name="'+name+'"]').filter(':checked').length;
                return (count > arg) ? false : true;
            },
            minChecked : function(_inp,arg){
                var name = $(_inp).attr('name'),
                count = $(this.form).find('input[type="checkbox"][name="'+name+'"]').filter(':checked').length;
                return (count < arg) ? false : true;
            }
        },
        //Selectbox Kontrolü
        selectbox : {
            selected : function(val){
                return (val === '' || val === null) ? false : true;
            },
            maxSelected : function(val,arg){
                return (val !== null && val !== '' && val.length > arg) ? false : true; 
            },
            minSelected : function(val,arg){
                return (val !== null && val !== '' && val.length < arg) ? false : true;
            }
        },
        customReg : function(val,reg){
            var _reg = new RegExp(reg);
            return ((_reg.test(val) === false) && val!=='') ? false : true ;
        }
    };
    /**
    * error promp method
    * @return {Void}
    */
    HsnValidate.prototype.window = {
        open : function(_inp,error){
            //if($(_inp).parent().find('.'+options.errorClass).length > 0 ){return;}
            var pos,W,H,T,errorObject,errorCloseObject;
            pos = $(_inp).position();
            W = $(_inp).width();
            H = $(_inp).height();
            T= pos.top;
            errorObject = $('<span>').addClass(this.options.errorClass);
            errorCloseObject = $('<span>x</span>');
            errorCloseObject.addClass(this.options.errorCloseClass);
            errorObject.empty().css({
                'left':pos.left+W+30+'px',
                'top' :T+'px'
            });
            $(_inp).parent().append(errorObject);
            errorObject.append(error,errorCloseObject);
            this.handler = true; 
        },
        close : function(_inp){
            $(_inp).parent().children('.'+this.options.errorClass+'').remove();
             this.handler = false;
        }
    };
    /**
    * Ajax function
    *
    *@return {Void}
    */
    HsnValidate.prototype.ajax = function(){
        var data, url, that = this;
        data = $(this.form).serialize();
        url = (this.options.ajax.url) ? this.options.ajax.url : $(this.form).attr('action');
        /* Debug */
        if(!this.options.ajax.url && $(this.form).attr('action') === ''){ console.log('Form action not valid !'); }
        $.ajax({
            type    : that.options.ajax.type,
            url     : url,
            data    : data,
            dataType: that.options.ajax.dataType,
            options: that.options,
            beforeSend: function(){
                return that.options.ajax.beforeSend();
            }
        })
        .done(function(result){that.options.ajax.success(result);})
        .fail(function(jqXHR, textStatus){ that.options.ajax.fail(jqXHR, textStatus);})
        .always(function(result){that.options.ajax.complete(result);}); 
    };
    /**
    * Plugin hsnValidate
    * @param options : user options
    */
    $.fn.hsnValidate = function (options){
        if($.hsnValidateLanguage){
            messages = $.extend(true,{},messages,$.hsnValidateLanguage.messages);
        }
        return this.each(function(){
            new HsnValidate(this,options);
            return this;
        });
    };

})(jQuery);