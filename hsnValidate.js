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
(function ($) {
    "use strict";
    /**
    *  Declare variables
    */
    var HsnValidate = {}; // Plugin Class
    var fields = {}; // Current fields/fieldss
    // RegExp for input validate rules
    var reg = new RegExp(/(minChecked|maxChecked|minSelected|maxSelected|minLength|maxLength|equal|custom)\[[(\w)-_]{1,10}\]/i);
    // RegExp for mail kontrol method
    var regMail = new RegExp(/^[a-z]{1}[\d\w\.-]+@[\d\w-]{3,}\.[\w]{2,3}(\.\w{2})?$/);
    //RegExp for input number control method
    var regNumber = new RegExp(/^[\+][0-9]+?$|^[0-9]+?$/);
    /**
    *  Form kontrol hata mesajları 
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
    *  Eklenti default ayarları
    */
    var defaults = {
        errorClass    : 'formHata', // Hata mesajı penceresine eklenecek olan class
        errorCloseClass : 'formHataKapa', // Hata mesajı penceresini kapatan HTML elementine eklenecek class
        ajax : { // Ajax işlemleri
          call    : false, // Ajax işlemi yapmak isyorsanız true olarak ayarlamalısınız.
          type    : 'GET', // Ajax post type
          url     : null, // Ajax url. URL bilgisini burada eklemek yerine FORM action özniyeliğinde de belirtebilirsiniz.
          dataType  : 'html', // Ajax dataType
          beforeSend  : $.noop, // Ajax başlamadan önce çalıştırılıcak fonksiyon
          success   : $.noop, // Ajax işlemi başarılı ise çalıştırılacak fonksiyon
          fail    : $.noop, // Ajax işlemi başarısız ise çalıştırılacak fonksiyon
          complete  : $.noop // Ajax işlemi tamamlandığında (başarılı yada başarısız) çalıştırılacak fonksiyon
        },
        realTime   : true, // Eğer true seçilirse real-time form kontrolü aktif edilir
        onCompleteFunc  : $.noop, // Form kontrolü tamamlandıktan sonra çalıştırılacak fonksiyon
        customReg   : {} // Costum Reg metodu değişkeni
    };
    /**
    * Plugin Class
    *
    * @param {object} form : Kontrol edilen <form> elementi
    * @param {object} options : Kullanıcının belirlediği ayarlar
    * @return {method} events 
    */
    HsnValidate = function(form,options){
        /**
        *  Public  Properties
        *  @property handler : uses to handle submit event
        *  @property options : stored plugin options
        *  @property form : stored <form> element
        */
        this.handler = false;
        this.options = $.extend(true,{},defaults,options);
        this.form = form ;
        // Events methodunu başlatalım
        return this.events.call(this);
    };
    /**
    * Events Method
    * Eklentinin çalışmasını tetikleyecek eventları tanımlar
    * 
    * @return {method} init, {method} reset or {false}
    */
    HsnValidate.prototype.events = function(){
        var that = this; // scoped this
        // Handle submit event 
        $(this.form).submit(function(e){
            // kontrol edilecek alanlar global değişkene aktarıldı
            // fields to be controlled transferred to global variable
            fields = this.querySelectorAll('[data-hsnValidate]');
            // init metodunu başlat
            return that.init.call(that,e);
        });
        // real-time option control
        if(this.options.realTime === true){
            // handle change event for form elements (without checkbox)
            $(this.form).find('[data-hsnValidate]').not('[type=checkbox]').on('change',function(e){
                // field to be controlled transferred to global variable
                fields = $(this);
                // init metodunu başlat
                return that.init.call(that,e);
            });
            // handle click event for checkboxes
            $(this.form).find('[data-hsnValidate][type=checkbox]').on('click',function(e){
                var name = this.getAttribute('name');
                // fields to be controlled transferred to global variable
                fields = that.form.querySelectorAll('[data-hsnValidate][type=checkbox][name='+name+']');
                // init metodunu başlat
                return that.init.call(that,e);
            });
        }
        // Reset Butonu ile hata mesajlarını temizleme
        $(this.form).find('input[type=reset]').on('click',function(){
            // kontrol edilmiş alanlarda hata mesajı varsa temizemek için reset metodunu çalıştırdık
            return that.reset.call(that);
        });
        // Manuel olarak hata mesajlarını kapatma fonksiyonu
        $(this.form).on('click','.'+this.options.errorCloseClass, function(){
            var _errProp = this.parentNode;
            if(_errProp){ _errProp.parentNode.removeChild(_errProp); }
            return false;
        });
    };
    /**
    * Init Method
    * 
    * @params {Object} e : event object
    * @return {Function} or {Boolen}
    */
    HsnValidate.prototype.init = function( e ){
        var that = this; // scoped this
        // Reset errors props from all elements 
        //console.time('hsn');
        this.reset.call( this, fields);
        // Start control each elements
        for ( var i = fields.length - 1; i >= 0; i-- ) {
            /**
            * Declaring variables
            * 
            * @params {object} _el : current field
            * @params {string} _errors : current field's errors
            * @params {string} _val : current field's value
            * @params {object} _methods : current field's control methods 
            */
            var _el, _errors, _val = {}, _methods = {}; 
            _el = fields[i];
            _errors ='';
            _val = $( _el ).val();
            // Kontrol metodlarını alalım
            _methods = _el.getAttribute( 'data-hsnvalidate' ).split(',');
            // Metotları kontrole başlayalım
            // that.check : Object Fields Control Method
            for ( var j = _methods.length - 1; j >= 0; j-- ) {
                if( _methods[j] === 'required' ){
                    if( _el.getAttribute('type') === 'checkbox' && !that.check.checkbox.checked( _el ) ){ _errors += messages.checkbox+'<br />'; }
                    else if( _el.tagName ==='SELECT' && !that.check.selectbox.selected( _val ) ){ _errors += messages.selectbox+'<br />'; }
                    if( ( _el.getAttribute('type') ==='text' || _el.tagName ==='TEXTAREA' ) && !that.check.space.call( that, _val ) ){ _errors += messages.empty+'<br />'; }  
                }
                if( _methods[j] === 'number' && !that.check.number( _val ) ){
                    _errors += messages.number+'<br />';
                }
                if( _methods[j] === 'email' && !that.check.mail( _val ) ){
                    _errors += messages.email+'<br />';
                }
                if( _methods[j] === 'creditCard' && _val !=='' && !that.check.creditCard( _val ) ){
                    _errors += messages.creditCard+'<br />';
                }
                if( reg.test( _methods[j] ) ){
                    var rules;
                    rules = _methods[j].split( /\[|,|\]/ );
                    if( rules[0] === 'maxLength' && !that.check.maxLength( _val, rules[1] ) ){
                        _errors += messages.maxLength.replace( '{count}', rules[1] )+'<br />';
                    }else if( rules[0] === 'minLength' && !that.check.minLength( _val, rules[1] ) ){
                        _errors += messages.minLength.replace( '{count}', rules[1] )+'<br />';
                    }else if( rules[0] === 'maxChecked' && !that.check.checkbox.maxChecked.call( that, _el, rules[1] ) ){
                        _el = that.form.querySelectorAll( 'input[type=checkbox][data-hsnvalidate][name='+ _el.name +']' )[0];
                        _errors += messages.maxChecked.replace( '{count}', rules[1] )+'<br />';
                    }else if( rules[0] === 'minChecked' && !that.check.checkbox.minChecked.call( that, _el, rules[1] ) ){
                        _el = that.form.querySelectorAll( 'input[type=checkbox][data-hsnvalidate][name='+ _el.name +']' )[0];
                        _errors += messages.minChecked.replace( '{count}', rules[1] )+'<br />';
                    }else if( rules[0] === 'maxSelected' && !that.check.selectbox.maxSelected( _val, rules[1] ) ){
                        _errors += messages.maxSelected.replace( '{count}', rules[1] )+'<br />';
                    }else if( rules[0] === 'minSelected' && !that.check.selectbox.minSelected( _val, rules[1] ) ){
                        _errors += messages.minSelected.replace( '{count}', rules[1] )+'<br />';
                    }else if( rules[0] === 'equal' && !that.check.equal.call( that, _val, rules[1] ) ){
                        _errors += messages.notEqual+'<br />';
                    }else if( rules[0] === 'custom' && !that.check.customReg( _val, that.options.customReg[ rules[1] ].method ) ){
                        _errors += ( that.options.customReg[ rules[1] ].errorMessage || messages.empty )+'<br />';
                    }
                }
            }
            if( _errors !== '' ){ that.window.open.call( that , _el, _errors ); }
        }
        //console.timeEnd('hsn');
        if( e.type !== 'submit' ){ return; }
        else if( that.handler === true ){ return false; }
        else{
            if( that.options.ajax.call ){
                that.ajax.call( that, arguments );
                return false;
            }
            return that.options.onCompleteFunc( that, e );
        }
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
        space : function( val ){
            return ( this.clear( val ) === '' ) ? false : true;
        },
        /**
        * Mail Kontrolü - Gelen değerin geçerli bir eposta adresi olup olmadığını kontrol eder
        *
        * @return {Boolen} input değeri geçersiz bir eposta ise ve input değeri boş değilse false döner
        */
        mail : function( val ){
            return ( ( regMail.test( val ) === false ) && val !== '' ) ? false : true ;
        },
        //Numara Kontrolu
        number : function( val ){
            return ( ( regNumber.test( val ) === false ) && val !== '' ) ?  false : true;
        },
        //Minimum uzunluk kontrol
        minLength : function( val, arg ){
            var _length = val.length;
            return ( _length < arg && _length !== 0 ) ? false : true;
        },
        //Max uzunluk kontrol
        maxLength : function( val, arg ){
            return ( val.length > arg ) ? false : true;
        },
        //Equal Control
        equal : function( val, arg ){
            return ( $( this.form ).find( 'input[type=text][name='+arg+']' ).val() !== val ) ? false : true;
        },
        /*  Credit Card Control
        *
        * @from : http://af-design.com/blog/2010/08/18/validating-credit-card-numbers 
        * @return {Boolen} 
        */
        creditCard : function( val ){
            var reg, cardNumber, pos, digit, i, sub_total, sum = 0, strlen;
            reg = new RegExp( /[^0-9]+/g );
            cardNumber = val.replace( reg, '' );
            strlen = cardNumber.length;
            if( strlen < 16 ){ return false; }
            for( i=0; i<strlen; i++ ){
                pos = strlen - i;
                digit = parseInt( cardNumber.substring( pos - 1, pos ), 10 );
                if( i % 2 === 1 ){
                    sub_total = digit * 2;
                    if( sub_total > 9 ){
                        sub_total = 1 + ( sub_total - 10 );
                    }
                } else {
                    sub_total = digit;
                }
                sum += sub_total;
            }
            if( sum > 0 && sum % 10 === 0 ){
                return true;
            }
            return false;
        },
        //Checkbox Kontrolu
        checkbox : {
            checked : function( _inp ){
                return ( !_inp.checked ) ? false : true;
            },
            maxChecked : function( _inp, arg ){  
                var count =  $( this.form.querySelectorAll( 'input[type=checkbox][name='+ _inp.name +']' ) ).filter( ':checked' ).length ;
                return ( count > arg ) ? false : true;
            },
            minChecked : function( _inp, arg ){
                var count =  $( this.form.querySelectorAll( 'input[type=checkbox][name='+ _inp.name +']' ) ).filter( ':checked' ).length ;
                return ( count < arg ) ? false : true;
            }
        },
        //Selectbox Kontrolü
        selectbox : {
            selected : function( val ){
                return ( val === '' || val === null ) ? false : true;
            },
            maxSelected : function( val, arg){
                return ( val !== null && val !== '' && val.length > arg ) ? false : true; 
            },
            minSelected : function( val, arg ){
                return ( val !== null && val !== '' && val.length < arg ) ? false : true;
            }
        },
        customReg : function( val, reg ){
            var _reg = new RegExp( reg );
            return ( ( _reg.test( val ) === false ) && val !== '' ) ? false : true ;
        }
    };
    /**
    * error promp method
    * @return {Void}
    */
    HsnValidate.prototype.window = {
        open : function( _inp, error ){
            var _inpParent = _inp.parentNode;
            if( _inpParent === undefined ){ _inpParent = _inp[0].parentNode ;}
            if( $( _inpParent ).find( '.'+this.options.errorClass ).length > 0 ){ return; }
            var pos, W, H, T, errorObject, errorCloseObject;
            pos = $( _inp ).position();
            W = $( _inp ).width();
            H = $( _inp ).height();
            T= pos.top;
            errorObject = $( '<span>' ).addClass( this.options.errorClass );
            errorCloseObject = $( '<span>x</span>' );
            errorCloseObject.addClass( this.options.errorCloseClass );
            errorObject.empty().css({
                'left':pos.left+W+30+'px',
                'top' :T+'px'
            });
            $( _inpParent ).append( errorObject );
            errorObject.append( error, errorCloseObject );
            this.handler = true; 
        },
        close : function( _inp ){
            _inp.parentNode.removeChild( _inp );
            this.handler = false;
        }
    };
    /**
    * İnput reset function
    * @param {String} _inp 
    */
    HsnValidate.prototype.reset = function( _inp ){
        var that = this, _errorMessages = {};
        if( _inp === undefined || ( _inp.length > 1 && _inp[0].getAttribute('type') !== 'checkbox' ) ){ 
            _errorMessages = $(that.form).find( '.'+ that.options.errorClass ); 
        }
        else{ 
            _errorMessages = $(_inp[0].parentNode).find( '.'+that.options.errorClass ); 
        }
        for(var i = _errorMessages.length -1; i >= 0; i--){
            that.window.close.call( that, _errorMessages[i] );
        } 
    };
    /**
    * Clear - İnput değerinin sağ ve solundaki boşlukları temizler
    *
    * @param {string} value
    * @return {String} 
    */
    HsnValidate.prototype.clear = function( value ){
      return value.replace( /^\s+|\s+$/g, '' );
    };
    /**
    * Ajax function
    *
    *@return {Void}
    */
    HsnValidate.prototype.ajax = function(){
        var data, url, that = this, formAction;
        data = $( this.form ).serialize();
        formAction = this.form.getAttribute('action');
        url = ( this.options.ajax.url ) ? this.options.ajax.url : formAction;
        /* Debug */
        if( !this.options.ajax.url && ( formAction === '' || formAction === null ) ){ return console.log('Form action not valid !'); }
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
        .done( function( result ){ that.options.ajax.success( that, result ); } )
        .fail( function( jqXHR, textStatus ){ that.options.ajax.fail( jqXHR, textStatus ); } )
        .always( function( result ){ that.options.ajax.complete( result ); } ); 
    };
    /**
    * Plugin hsnValidate
    * @param options : user options
    */
    $.fn.hsnValidate = function (options){
        if( $.hsnValidateLanguage ){
            messages = $.extend( true, {}, messages, $.hsnValidateLanguage.messages );
        }
        return this.each( function(){
            new HsnValidate( this, options );
            return this;
        });
    };
})(jQuery);