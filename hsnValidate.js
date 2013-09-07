/*!
 * hsnValidate - jQuery front-end form validate plugin
 * version: 1.0 (30 Mart 2013, Cumartesi)
 * @jQuery Support: v1.7 and above
 * @Browser Support : ie8 and above, and all modern browsers
 *
 * Examples : http://lab.hasanaydogdu.com/hsnValidate/#examples
 * GitHub Repository : https://github.com/hsnayd/hsnValidate 
 * Lisans: MIT ve GPL
 *  * http://www.opensource.org/licenses/mit-license.php
 *  * http://www.gnu.org/licenses/gpl.txt
 *
 * Copyright 2012 Hasan Aydoğdu - http://www.hasanaydogdu.com
 *
 */
( function ( $ ) {
    "use strict";
    /**
    *  Declare variables
    */
    var HsnValidate = {}, // Plugin Class
        fields = {}, // Current fields/fieldss
        // RegExp for input validate rules
        reg = new RegExp( /(minChecked|maxChecked|minSelected|maxSelected|minLength|maxLength|equal|customReg)\[[(\w)-_]{1,10}\]/i ),
        // RegExp for mail control method
        regMail = new RegExp( /^[a-z]{1}[\d\w\.-]+@[\d\w-]{3,}\.[\w]{2,3}(\.\w{2})?$/ ),
        //RegExp for input number control method
        regNumber = new RegExp( /^[\+][0-9]+?$|^[0-9]+?$/ );
    /**
    *  Form validate error messages
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
    *  Plugin defaults
    */
    var defaults = {
        errorClass    : 'formHata', // The html class which to be added to error message window
        errorCloseClass : 'formHataKapa', // The html class that will add on element of HTML which is closing the error message window
        ajax : { // Ajax processing
            call    : false, // If you want to make an ajax request, set it to true
            type    : 'GET',
            url     : null, // Ajax url. Instead of adding URL information here, you can also specify it at form action attribute(URL bilgisini burada eklemek yerine FORM action özniteliğinde de belirtebilirsiniz.)
            dataType  : 'html',
            beforeSend  : $.noop,
            success   : $.noop,
            fail    : $.noop,
            complete  : $.noop
        },
        realTime   : true, // To enable real-time form control, set this option true (Eğer true seçilirse real-time form kontrolü aktif edilir)
        onCompleteFunc  : $.noop, // This is the function to be run after the completion of form control // Form kontrolü tamamlandıktan sonra çalıştırılacak fonksiyon
        customReg   : {} // Costum reg method variable
    };
    /**
    * Plugin Class
    *
    * @param {object} form : <form> element which being controlled
    * @param {object} options : User-specified settings
    * @return {method} events 
    */
    HsnValidate = function( form, options ){
        /**
        *  Public  Properties
        *  @property handler : It is used to stop or resume submit event handler
        *  @property options : Property is stored in plugin options
        *  @property form : Property is stored in <form> element
        */
        this.handler = false;
        this.options = $.extend( true, {}, defaults, options );
        this.form = form ;
        return this.events.call( this );
    };
    /**
    * Events Method
    * This is the method of handling events
    * 
    * @return {method} init, {method} reset or {boolean} false
    */
    HsnValidate.prototype.events = function(){
        var that = this; // stored this
        // Handle submit event 
        $( this.form ).submit( function( e ){
            // fields to be controlled transferred to global variable
            fields = this.querySelectorAll( '[data-hsnvalidate]' );
            return that.init.call( that, e );
        });
        // real-time option control
        if( this.options.realTime === true ){
            // handle change event for form elements (without checkbox)
            $( this.form ).find( '[data-hsnvalidate]' ).not( '[type=checkbox]' ).on( 'change', function( e ){
                // field to be controlled transferred to global variable
                fields = $( this );
                return that.init.call( that, e );
            });
            // handle click event for checkboxes
            $( this.form ).find( '[data-hsnvalidate][type=checkbox]' ).on( 'click', function( e ){
                // fields to be controlled transferred to global variable
                fields = that.form.querySelectorAll( '[data-hsnvalidate][type=checkbox][name='+ this.name +']' );
                return that.init.call( that, e );
            });
        }
        // handle <form> reset button to clear error messages
        $( this.form ).find( '[type=reset]' ).on( 'click', function(){
            return that.reset.call( that );
        });
        // error messages manually cleaning function
        // handle error close button to manually clearing error messages
        $( this.form ).on( 'click', '.'+this.options.errorCloseClass, function(){
            // We're checking the parent value of clicked element to avoid getting error
            // if parent value is true, clear error window
            var _errProp = this.parentNode;
            if( _errProp ){ that.window.close.call( that, _errProp ); }
            return false;
        });
    };
    /**
    * Init Method
    * In this method, fields are validated
    * 
    * @params {Object} e : event object
    * @return {Function} or {Boolen}
    */
    HsnValidate.prototype.init = function( e ){
        var that = this; // stored this
        // Reset errors props from all elements 
        this.reset.call( this, fields );
        // Start control each elements
        for ( var i = fields.length - 1; i >= 0; i-- ) {
            /**
            * Declaring variables
            * 
            * @params {object} _el : current field
            * @params {string} _errors : current field's errors
            * @params {array} _val : current field's value
            * @params {array} _methods : current field's control methods 
            */
            var _el, _errors, _val = [], _methods = []; 
            _el = fields[i];
            _errors = '';
            _val = $( _el ).val();
            // get control methods
            _methods = _el.getAttribute( 'data-hsnvalidate' ).split( ',' );
            // start to check fields
            // that.check : Object Fields Control Method
            for ( var j = _methods.length - 1; j >= 0; j-- ) {
                // Required Control
                if( _methods[j] === 'required' ){
                    var _elType = _el.getAttribute('type');
                    if( _elType === 'checkbox' && !that.check.checkbox.checked( _el ) ){ _errors += messages.checkbox+'<br />'; }
                    else if( _el.tagName ==='SELECT' && !that.check.selectbox.selected( _val ) ){ _errors += messages.selectbox+'<br />'; }
                    if( ( _elType ==='text' || _elType ==='password' || _el.tagName ==='TEXTAREA' ) && !that.check.space.call( that, _val ) ){ _errors += messages.empty+'<br />'; }  
                }
                // Number Control
                if( _methods[j] === 'number' && !that.check.number( _val ) ){
                    _errors += messages.number+'<br />';
                }
                // Email Control
                if( _methods[j] === 'email' && !that.check.mail( _val ) ){
                    _errors += messages.email+'<br />';
                }
                // Credit Cart Control
                if( _methods[j] === 'creditCard' && _val !=='' && !that.check.creditCard( _val ) ){
                    _errors += messages.creditCard+'<br />';
                }
                // Rules Control (minChecked, maxChecked, minSelected etc.)
                if( reg.test( _methods[j] ) ){
                    // get rules
                    // And start to check rules
                    // {count} which used below is the specified maximum or minimum value
                    // e.g if method is minLength and  rule is 2 ( minLength[2] ) 
                    // Output error windows text will be : 'Please select minimum 2 options. '
                    var rules = _methods[j].split( /\[|,|\]/ );
                    if( rules[0] === 'maxLength' && !that.check.maxLength( _val, rules[1] ) ){
                        _errors += messages.maxLength.replace( '{count}', rules[1] )+'<br />';
                    }else if( rules[0] === 'minLength' && !that.check.minLength( _val, rules[1] ) ){
                        _errors += messages.minLength.replace( '{count}', rules[1] )+'<br />';
                    }else if( rules[0] === 'maxChecked' && !that.check.checkbox.maxChecked.call( that, _el, rules[1] ) ){
                        // Redirect to the first checkbox
                        // I want to see the error message on the first element of checkbox group
                        _el = that.form.querySelectorAll( 'input[type=checkbox][data-hsnvalidate][name='+ _el.name +']' )[0];
                        _errors += messages.maxChecked.replace( '{count}', rules[1] )+'<br />';
                    }else if( rules[0] === 'minChecked' && !that.check.checkbox.minChecked.call( that, _el, rules[1] ) ){
                        // Redirect to the first checkbox
                        _el = that.form.querySelectorAll( 'input[type=checkbox][data-hsnvalidate][name='+ _el.name +']' )[0];
                        _errors += messages.minChecked.replace( '{count}', rules[1] )+'<br />';
                    }else if( rules[0] === 'maxSelected' && !that.check.selectbox.maxSelected( _val, rules[1] ) ){
                        _errors += messages.maxSelected.replace( '{count}', rules[1] )+'<br />';
                    }else if( rules[0] === 'minSelected' && !that.check.selectbox.minSelected( _val, rules[1] ) ){
                        _errors += messages.minSelected.replace( '{count}', rules[1] )+'<br />';
                    }else if( rules[0] === 'equal' && !that.check.equal.call( that, _val, rules[1] ) ){
                        _errors += messages.notEqual+'<br />';
                    }else if( rules[0] === 'customReg' && !that.check.customReg( _val, that.options.customReg[ rules[1] ].method ) ){
                        _errors += ( that.options.customReg[ rules[1] ].errorMessage || messages.empty )+'<br />';
                    }
                }
            }
            // Check the errors
            if( _errors !== '' ){ that.window.open.call( that , _el, _errors ); }
        }
        if( e.type !== 'submit' ){ return; } // event type submit değilse her şartta işlemleri bitir
        else if( that.handler === true ){ return false; } // Eğer event type submit ise ve handler true ise submiti durdur
        else{ // Eğer validation başarılı ise bitiş fonksiyonlarını çalıştır 
            // Ajax işlemi yapılacaksa ajax metodunu çalıştır
            if( that.options.ajax.call ){
                that.ajax.call( that, arguments );
                return false;
            }
            // Ajax işlemi yoksa bitiş fonksiyonunu çalıştır
            return that.options.onCompleteFunc( that, e );
        }
    };
    /**
    * Validator functions
    * @param {String} Val : input value
    */
    HsnValidate.prototype.check = {
        //  Boşluk Kontrolü - gelen değerin boş olup olmadığını kontrol eder
        space : function( val ){
            return ( this.clear( val ) === '' ) ? false : true;
        },
        //  Mail Kontrolü - Gelen değerin geçerli bir eposta adresi olup olmadığını kontrol eder
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
            return ( $( this.form ).find( 'input[type=text][name='+ arg +']' ).val() !== val ) ? false : true;
        },
        /*  Credit Card Control
        *
        * @from : http://af-design.com/blog/2010/08/18/validating-credit-card-numbers 
        */
        creditCard : function( val ){
            var reg, cardNumber, pos, digit, i, sub_total, sum = 0, strlen;
            reg = new RegExp( /[^0-9]+/g );
            cardNumber = val.replace( reg, '' );
            strlen = cardNumber.length;
            if( strlen < 16 ){ return false; }
            for( i=0 ; i < strlen ; i++ ){
                pos = strlen - i;
                digit = parseInt( cardNumber.substring( pos - 1, pos ), 10 );
                if( i % 2 === 1 ){
                    sub_total = digit * 2 ;
                    if( sub_total > 9 ){
                        sub_total = 1 + ( sub_total - 10 );
                    }
                } else {
                    sub_total = digit ;
                }
                sum += sub_total ;
            }
            if( sum > 0 && sum % 10 === 0 ){
                return true ;
            }
            return false ;
        },
        //Checkbox Kontrolu
        checkbox : {
            checked : function( _inp ){
                return ( !_inp.checked ) ? false : true ;
            },
            maxChecked : function( _inp, arg ){  
                var count =  $( this.form.querySelectorAll( 'input[type=checkbox][name='+ _inp.name +']' ) ).filter( ':checked' ).length ;
                return ( count > arg ) ? false : true ;
            },
            minChecked : function( _inp, arg ){
                var count =  $( this.form.querySelectorAll( 'input[type=checkbox][name='+ _inp.name +']' ) ).filter( ':checked' ).length ;
                return ( count < arg ) ? false : true ;
            }
        },
        //Selectbox Kontrolü
        selectbox : {
            selected : function( val ){
                return ( val === '' || val === null ) ? false : true ;
            },
            maxSelected : function( val, arg){
                return ( val !== null && val !== '' && val.length > arg ) ? false : true ; 
            },
            minSelected : function( val, arg ){
                return ( val !== null && val !== '' && val.length < arg ) ? false : true ;
            }
        },
        // Custom Reg kontrol fonksiyonu
        customReg : function( val, reg ){
            var _reg = new RegExp( reg );
            return ( ( _reg.test( val ) === false ) && val !== '' ) ? false : true ;
        }
    };
    /**
    * error window method
    * @return {Void}
    */
    HsnValidate.prototype.window = {
        /**
        * Hata penceresi açma metodu
        * @params _inp{object} : hatalı element ( native elemenet yada Jquery object )
        * @params error : hata mesajı
        */
        open : function( _inp, error ){
            // Hata penceresi açılacak olan elementin parentını alalım
            var _inpParent = _inp.parentNode ;
            // Parent undefined ise demekki object olarak gelmiştir. elemente dönüştürelim
            if( typeof _inpParent === 'undefined' ){ _inpParent = _inp[0].parentNode ; }
            // Eğer hata penceresi açılacak elementin ( gelen elementin parentının içerisi ) 
            // içinde başka bir hata penceresi zaten açılmış ise fonksiyonu döndür.
            if( $( _inpParent ).find( '.'+this.options.errorClass ).length > 0 ){ return ; }
            // Değişkenlerimizi declare edelim
            var pos, W, H, T, errorObject, errorCloseObject ;
            // elementin posizyonunun alalım
            // !! ie8 desteği için jQuery fonksiyonlarını kullanıyoruz
            pos = $( _inp ).position();
            // Genişlik ve yüksekliğini alalım
            // !! ie8 desteği için jQuery fonksiyonlarını kullanıyoruz
            W = $( _inp ).width();
            H = $( _inp ).height();
            // top değerini T değişkenine depoladık
            T= pos.top ;
            // Hata pencere elementini oluşturalım
            errorObject = document.createElement( 'span' );
            // Hata pencere classımızı ekleyelim
            errorObject.className = this.options.errorClass ;
            // Hata penceresini kapatmak için kullanacağımız elementi oluşturalım
            errorCloseObject = document.createElement( 'span' );
            // görüntü olarak x işaretini ekliyoruz manuel hata penceresi kapatma elementine
            errorCloseObject.innerHTML = 'x';
            // son olarak manuel hata penceresi kapatma objemize hata penceresi kapatma elementi classını ekliyoruz
            errorCloseObject.className = this.options.errorCloseClass ;
            // Hata pencere elementimizin içini boşaltalım
            // daha sonra posizyonunu belirleyelim
            $(errorObject).empty().css({
                'left':pos.left+W+30+'px',
                'top' :T+'px'
            });
            // dökumanımıza ekleyelim
            _inpParent.appendChild( errorObject );
            // Hata mesajımızı içine ekleyelim
            errorObject.innerHTML = error ;
            // hata penceresi kapama elementimizi de hata penceresi elementine ekleyelim
            errorObject.appendChild( errorCloseObject );
            // Submiti durdurmak için handler ı true olarak ayarlayalım
            this.handler = true ; 
        },
        /** 
        * Hata penceresi kapatma metodu
        * 
        * @params _inp : kapatılacak hata mesajı penceresi elementi
        */
        close : function( _inp ){
            _inp.parentNode.removeChild( _inp );
            // Validasyon işlemi bittiği için
            // handlerı başlangıç pozisyonuna döndürüyoruz
            // aksi halde validation başarılı olsa dahi submit devam etmiyecektir.
            this.handler = false ;
        }
    };
    /**
    * form error window reset method
    * @param {object} _inp : 
    */
    HsnValidate.prototype.reset = function( _inp ){
        var that = this, // scoped this
        _errorMessages = {} ;
        // Eğer _inp değeri boşsa ( bu tüm <form> u resetleme işlemidir )
        // yada gelen _inp değeri birden fazla element içeriyorsa
        // ve bu elementler checkbox değilse
        if( typeof _inp === 'undefined' || ( _inp.length > 1 && _inp[0].getAttribute('type') !== 'checkbox' ) ){ 
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
        var data, url, that = this, formAction ;
        data = $( this.form ).serialize();
        formAction = this.form.getAttribute( 'action' );
        url = ( this.options.ajax.url ) ? this.options.ajax.url : formAction ;
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
            return this ;
        });
    };
})(jQuery);