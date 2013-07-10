/*!
 * hsnValidate - jQuery Eklentisi
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
    "use strict"
    // Declare variable `hsnValidate`
    var hsnValidate = {};
    var object = {};
    var reg = new RegExp(/(minChecked|maxChecked|minSelected|maxSelected|minLength|maxLength|equal|custom)\[(\w){1,10}\]/i);
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
    hsnValidate = function(form,options){
        /*!
        * @param handler : uses for handle submit
        * @param object : current element
        * @private
        */
        var handler = false;
        this.options = $.extend(true,{},defaults,options),
        this.form = form ;
        var $this = this;
        this.events.call(this,arguments);


    }
    /**
    * Events
    * handle submit, change ve checkbox click events
    * 
    * @return {Void}
    */
    hsnValidate.prototype.events = function(){
        // define private 'that' for sub functions
        var that = this;
        $(this.form).submit(function(e){
            e.preventDefault();
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
    }
    hsnValidate.prototype.deneme = function () {
        console.log('vay amk ')
    }
    /**
    * Init Function
    * @method : this.init();
    * @params {Object} e : event object
    * @return {Function} or {Boolen}
    */
    hsnValidate.prototype.init = function(e){
        // Reset errors props from all elements 
        $.hsnValidate.reset.call(this,$(object));
        // Define private 'this' for sub functions
        var that = this;
        // Start control each elements
        $(object).each(function(i, element){
            var _el, _errors, _val = {}, _methods = {}; 
            _el = element;
            _errors ='';
            _val = $(_el).val();
             /*_methods = $(_el).data('hsnvalidate').split(',');*/
            $(_methods).each(function(i, method) {
                if(method === 'required'){
                    if($(_el).attr('type')=='checkbox' && !check.checkbox.checked(el)){_errors += messages.checkbox+'<br />';}
                    else if(_el.tagName =='SELECT' && !check.selectbox.selected(_val)){_errors += messages.selectbox+'<br />';}
                    else if(($(_el).attr('type') =='text' || _el.tagName =='TEXTAREA') && !check.space(_val)){_errors += messages.empty+'<br />';}  
                }
                if(method == 'number' && !check.number(_val)){
                    _errors += messages.number+'<br />';
                }
                if(method == 'email' && !check.mail(_val)){
                    _errors += messages.email+'<br />';
                }
                if(method == 'creditCard' && _val!='' && !check.creditCard(_val)){
                    _errors += messages.creditCard+'<br />';
                } 
                if(reg.test(method)){
                    var rules = method.split(/\[|,|\]/);
                    if(rules[0] == 'maxLength' && !check.maxLength(_val,rules[1])){
                        _errors += messages.maxLength.replace('{count}',rules[1])+'<br />';
                    }else if(rules[0] == 'minLength' && !check.minLength(_val,rules[1])){
                        _errors += messages.minLength.replace('{count}',rules[1])+'<br />';
                    }else if(rules[0] == 'maxChecked' && !check.checkbox.maxChecked(el,rules[1])){
                        var name = $(el).attr('name');
                        el = $(object).filter('[type=checkbox][name='+name+']').eq(0);
                        _errors += messages.maxChecked.replace('{count}',rules[1])+'<br />';
                    }else if(rules[0] == 'minChecked' && !check.checkbox.minChecked(el,rules[1]) ){
                        var name = $(el).attr('name');
                        el = $(object).filter('[type=checkbox][name='+name+']').eq(0);
                        _errors += messages.minChecked.replace('{count}',rules[1])+'<br />';
                    }else if(rules[0] == 'maxSelected' && !check.selectbox.maxSelected(_val,rules[1])){
                        _errors += messages.maxSelected.replace('{count}',rules[1])+'<br />';
                    }else if(rules[0] == 'minSelected' && !check.selectbox.minSelected(_val,rules[1])){
                        _errors += messages.minSelected.replace('{count}',rules[1])+'<br />';
                    }else if(rules[0] == 'equal' && !check.equal(_val,rules[1])){
                        _errors += messages.notEqual+'<br />'
                    }else if(rules[0] == 'custom' && !check.customReg(_val,options.customReg[rules[1]].method)){
                        console.log(options.customReg);
                        _errors += (options.customReg[rules[1]].errorMessage || messages.empty)+'<br />'
                    }
                }
            });
            if(_errors != '')  _window.open(el,_errors);
        });
        if(handler || e.type != 'submit'){return false;}
        else{
        /*if(options.onCompleteFunc){
          options.onCompleteFunc()
          return false;
        }else{return;}*/
        if(options.ajax.call){
          ajax();
          return false; 
        }
        }
    };
    /**
    * Clear - İnput değerinin sağ ve solundaki boşlukları temizler
    *
    * @param {string} value
    * @return {String} 
    */
    hsnValidate.prototype.clear = function(value){
      return value = value.replace(/^\s+|\s+$/g, '');
    }
    /**
    * Validator functions
    * @param {String} Val : input value
    */
    hsnValidate.prototype.check = {
    /**
    * Boşluk Kontrolü - gelen değerin boş olup olmadığını kontrol eder
    * @return {Boolen} Return true if input value isnt empty 
    *
    */
    space : function(val){
        return (clear(val) == '') ? false : true;
    },
    /**
    * Mail Kontrolü - Gelen değerin geçerli bir eposta adresi olup olmadığını kontrol eder
    *
    * @return {Boolen} input değeri geçersiz bir eposta ise ve input değeri boş değilse false döner
    */
    mail : function(val){
      var reg = new RegExp(/^[a-z]{1}[\d\w\.-]+@[\d\w-]{3,}\.[\w]{2,3}(\.\w{2})?$/);
      return ((reg.test(val) == false) && val!='') ? false : true ;
    },
    //Numara Kontrolu
    number : function(val){
      var reg = new RegExp(/^[\+][0-9]+?$|^[0-9]+?$/);
      return ((reg.test(val) == false) && val!='') ?  false : true;
    },
    //Minimum uzunluk kontrol
    minLength : function(val,arg){
      var _length = val.length;
      return ( _length < arg && _length != 0) ? false : true;
    },
    //Max uzunluk kontrol
    maxLength : function(val,arg){
      return (val.length > arg) ? false : true;
    },
    //Equal Control
    equal : function(val,arg){
      return ($(form).find('input[type=text][name='+arg+']').val() != val) ? false : true;
    },
    /*  Credit Card Control
      @ From : http://af-design.com/blog/2010/08/18/validating-credit-card-numbers 
    */
    creditCard : function(val){
      var reg = new RegExp(/[^0-9]+/g),
      cardNumber = val.replace(reg,''),
      pos, digit, i, sub_total, sum = 0,
      strlen = cardNumber.length;
      if(strlen < 16){return false;}
      for(i=0;i<strlen;i++){
        pos = strlen - i;
        digit = parseInt(cardNumber.substring(pos - 1, pos));
        if(i % 2 == 1){
          sub_total = digit * 2;
          if(sub_total > 9){
            sub_total = 1 + (sub_total - 10);
          }
        } else {
          sub_total = digit;
        }
        sum += sub_total;
      }
      if(sum > 0 && sum % 10 == 0){
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
            count = $(form).find('input[type="checkbox"][name="'+name+'"]').filter(':checked').length;
        return (count > arg) ? false : true;
      },
      minChecked : function(_inp,arg){
        var name = $(_inp).attr('name'),
            count = $(form).find('input[type="checkbox"][name="'+name+'"]').filter(':checked').length;
        return (count < arg) ? false : true;
      }
    },
    //Selectbox Kontrolü
    selectbox : {
      selected : function(val){
        return (val == '' || val == null) ? false : true;
      },
      maxSelected : function(val,arg){
        return (val != null && val != '' && val.length > arg) ? false : true; 
      },
      minSelected : function(val,arg){
        return (val != null && val != '' && val.length < arg) ? false : true;
      }
    },
    customReg : function(val,reg){
      var reg = new RegExp(reg);
      return ((reg.test(val) == false) && val!='') ? false : true ;
    }
    }
  /*!
  * Plugin hsnValidate
  * @param options : user options
  */
  $.fn.hsnValidate = function (options)
  {
    return this.each(function(){
      new hsnValidate(this,options);
      return this;
    });
  }
  $.hsnValidate = function() {
        //ilerde kullanırız
    };
  /**
  * İnput reset function
  * @param {String} _inp 
  */
  $.hsnValidate.reset = function(_inp) {
    _inp.each(function(index, name) {
      //_window.close(name)
    }); 
  };


})(jQuery);