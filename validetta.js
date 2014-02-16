/*!
 * Validetta - Client-side form validation jQuery plugin
 * Version: 0.9.0 (16 February 2014)
 * @jQuery Requires: v1.7 or above
 * @Browser Support : ie8 or above, and all modern browsers
 *
 * Examples : http://lab.hasanaydogdu.com/validetta/#examples
 * GitHub Repository : https://github.com/hsnayd/validetta 
 * Lisans: MIT ve GPL
 *  * http://www.opensource.org/licenses/mit-license.php
 *  * http://www.gnu.org/licenses/gpl.txt
 *
 * Copyright 2013 Hasan Aydoğdu - http://www.hasanaydogdu.com
 *
 * Special Comment : I'm sorry for my english translation errors :)
 */
( function ( $ ) {
    "use strict";
    /**
     *  Declare variables
     */
    var Validetta = {}, // Plugin Class
        fields = {}, // Current fields/fieldss
        // RegExp for input validate rules
        reg = new RegExp( /(minChecked|maxChecked|minSelected|maxSelected|minLength|maxLength|equal|customReg)\[[(\w)-_]{1,15}\]/i ),
        // RegExp for mail control method
        // @from ( http://www.whatwg.org/specs/web-apps/current-work/multipage/states-of-the-type-attribute.html#e-mail-state-%28type=email%29 )
        regMail = new RegExp( /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/ ),
        //RegExp for input number control method
        regNumber = new RegExp( /^[\-\+]?\d+\.?\d*$/ );
    /**
     *  Form validate error messages
     */
    var messages = {
        empty   : 'This field is required. Please be sure to check.',
        email   : 'Your E-mail address appears to be invalid. Please be sure to check.',
        number    : 'You can enter only numbers in this field.',
        maxLength : 'Maximum {count} characters allowed!',
        minLength : 'Minimum {count} characters allowed!',
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
        display : 'bubble', // Error display options, // bubble / inline
        errorClass : 'validetta-bubble', // The html class which to be added to error message window
        errorClose : true, // Error windows close button. if you want to active it, set is true
        errorCloseClass : 'validetta-bubbleClose', // The html class that will add on element of HTML which is closing the error message window
        ajax : { // Ajax processing
            call    : false, // If you want to make an ajax request, set it to true
            type    : 'GET',
            url     : null, // Ajax url. !!! Instead of adding URL information here, you can also specify it at form action attribute.
            dataType  : 'html',
            beforeSend  : $.noop,
            success   : $.noop,
            fail    : $.noop,
            complete  : $.noop
        },
        realTime   : false, // To enable real-time form control, set this option true.
        onCompleteFunc  : $.noop, // This is the function to be run after the completion of form control.
        customReg   : {} // Costum reg method variable
    };
    /**
     * Plugin Class
     *
     * @param {object} form : <form> element which being controlled
     * @param {object} options : User-specified settings
     * @return {method} events
     */
    Validetta = function( form, options ){
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
     * @method events
     *   This is the method of handling events
     *
     * @return {method} init, {method} reset or {boolean} false
     */
    Validetta.prototype.events = function(){
        var that = this; // stored this
        // Handle submit event
        $( this.form ).submit( function( e ){
            // fields to be controlled transferred to global variable
            fields = this.querySelectorAll( '[data-validetta]' );
            return that.init.call( that, e );
        });
        // real-time option control
        if( this.options.realTime === true ){
            // handle change event for form elements (without checkbox)
            $( this.form ).find( '[data-validetta]' ).not( '[type=checkbox]' ).on( 'change', function( e ){
                // field to be controlled transferred to global variable
                fields = $( this );
                return that.init.call( that, e );
            });
            // handle click event for checkboxes
            $( this.form ).find( '[data-validetta][type=checkbox]' ).on( 'click', function( e ){
                // fields to be controlled transferred to global variable
                fields = that.form.querySelectorAll( '[data-validetta][type=checkbox][name="'+ this.name +'"]' );
                return that.init.call( that, e );
            });
        }
        // handle <form> reset button to clear error messages
        $( this.form ).find( '[type=reset]' ).on( 'click', function(){
            return that.reset.call( that );
        });
        // Error close button is active ?
        if( this.options.errorClose ) {
            // error messages manually cleaning function
            // handle error close button to manually clearing error messages
            $( this.form ).on( 'click', '.'+this.options.errorCloseClass, function(){
                // We're checking the parent value of clicked element to avoid getting error
                // if parent value is true, clear error window
                var _errProp = this.parentNode;
                if( _errProp ){ that.window.close.call( that, _errProp ); }
                return false;
            });
        }
    };
    /**
     * @method init
     *   In this method, fields are validated
     * 
     * @params {Object} e : event object
     * @return {Function} or {Boolen}
     */
    Validetta.prototype.init = function( e ){
        var that = this; // stored this
        // Reset error windows from all elements
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
            _methods = _el.getAttribute( 'data-validetta' ).split( ',' );
            // start to check fields
            // that.check : Object Fields Control Method
            for ( var j = _methods.length - 1; j >= 0; j-- ) {
                // Required Control
                if( _methods[j] === 'required' ){
                    var _elType = _el.getAttribute('type');
                    if( _elType === 'checkbox' && !that.check.checkbox.checked( _el ) ){ _errors += messages.checkbox+'<br />'; }
                    else if ( _elType === 'radio' && that.check.radio.call( that, _el ) ) { _errors += messages.empty+'<br />'; }
                    else if( _el.tagName ==='SELECT' && !that.check.selectbox.selected( _val ) ){ _errors += messages.selectbox+'<br />'; }
                    if( ( _elType ==='text' || _elType ==='password' || _el.tagName ==='TEXTAREA' ) && !that.check.empty.call( that, _val ) ){ _errors += messages.empty+'<br />'; }
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
                    // Output error windows text will be : 'Please select minimum 2 options.'
                    var rules = _methods[j].split( /\[|,|\]/ );
                    if( rules[0] === 'maxLength' && !that.check.maxLength( _val, rules[1] ) ){
                        _errors += messages.maxLength.replace( '{count}', rules[1] )+'<br />';
                    }else if( rules[0] === 'minLength' && !that.check.minLength( _val, rules[1] ) ){
                        _errors += messages.minLength.replace( '{count}', rules[1] )+'<br />';
                    }else if( rules[0] === 'maxChecked' && !that.check.checkbox.maxChecked.call( that, _el, rules[1] ) ){
                        // Redirect to the first checkbox
                        // I want to see the error message on the first element of checkbox group
                        _el = that.form.querySelectorAll( 'input[type=checkbox][data-validetta][name="'+ _el.name +'"]' )[0];
                        _errors += messages.maxChecked.replace( '{count}', rules[1] )+'<br />';
                    }else if( rules[0] === 'minChecked' && !that.check.checkbox.minChecked.call( that, _el, rules[1] ) ){
                        // Redirect to the first checkbox
                        _el = that.form.querySelectorAll( 'input[type=checkbox][data-validetta][name="'+ _el.name +'"]' )[0];
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
        if( e.type !== 'submit' ){ return; } // if event type is not submit, break
        else if( that.handler === true ){ return false; } // if event type is submit and handler is true, break submit
        else{
            // if ajax request set, start ajax process
            if( that.options.ajax.call ){
                that.ajax.call( that, arguments );
                return false;
            }
            // Return onComplateFunc()
            // onComplateFunc() was defined by default at line 64
            // if onComplateFunc() is not defined by user, submit process will continue
            return that.options.onCompleteFunc( that, e );
        }
    };
    /**
     * @method check
     *   Validator functions
     * @param {String} val : input value
     */
    Validetta.prototype.check = {
        // Empty check - it checks the value if it's empty or not
        empty : function( val ){
            return ( this.clear( val ) === '' ) ? false : true;
        },
        //  Mail check - it checks the value if it's a valid email address or not
        mail : function( val ){
            return ( ( regMail.test( val ) === false ) && val !== '' ) ? false : true ;
        },
        // Number check
        number : function( val ){
            return ( ( regNumber.test( val ) === false ) && val !== '' ) ?  false : true;
        },
        // Minimum length check
        minLength : function( val, arg ){
            var _length = val.length;
            return ( _length < arg && _length !== 0 ) ? false : true;
        },
        // Maximum lenght check
        maxLength : function( val, arg ){
            return ( val.length > arg ) ? false : true;
        },
        // Equal check
        equal : function( val, arg ){
            return ( $( this.form ).find( 'input[name="'+ arg +'"]' ).val() !== val ) ? false : true;
        },
        /**  
         * Credit Card Control
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
        //Checkbox check
        checkbox : {
            checked : function( _inp ){
                return ( !_inp.checked ) ? false : true ;
            },
            maxChecked : function( _inp, arg ){
                var count =  $( this.form.querySelectorAll( 'input[type=checkbox][name="'+ _inp.name +'"]' ) ).filter( ':checked' ).length ;
                return ( count > arg ) ? false : true ;
            },
            minChecked : function( _inp, arg ){
                var count =  $( this.form.querySelectorAll( 'input[type=checkbox][name="'+ _inp.name +'"]' ) ).filter( ':checked' ).length ;
                return ( count < arg ) ? false : true ;
            }
        },
        //Selectbox check
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
        // Radio
        radio : function ( _inp ) {
            var count = $( this.form.querySelectorAll( 'input[type=radio][name="'+ _inp.name +'"]' ) ).filter( ':checked' ).length ;
            return ( count === 1 ) ? false : true ;
        },
        // Custom reg check
        customReg : function( val, reg ){
            var _reg = new RegExp( reg );
            return ( ( _reg.test( val ) === false ) && val !== '' ) ? false : true ;
        }
    };
    /**
     * @method window
     *   This the section which opening or closing error windows process is done
     * @return {Void}
     */
    Validetta.prototype.window = {
        /**
         * @property open
         * @params _inp{object} : element which has an error ( it can be native element or jQuery object )
         * @params error : error message
         */
        open : function( _inp, error ){
            var _inpParent = _inp.parentNode ;
            // If the parent element undefined, that means _inp is an object. So we need to transform to the element
            if( typeof _inpParent === 'undefined' ){ _inpParent = _inp[0].parentNode ; }
            // if there is an error window which previously opened for _inp, return
            if( $( _inpParent ).find( '.'+this.options.errorClass ).length > 0 ){ return ; }
            // Create the error window object which will be appear
            var errorObject = document.createElement( 'span' );
            errorObject.className = this.options.errorClass;
            // if error display is bubble, calculate to positions
            if( this.options.display === 'bubble' ){
                var pos, W, H, T;
                // !! Here, JQuery functions are using to support the IE8
                pos = $( _inp ).position();
                // !! Here, JQuery functions are using to support the IE8
                W = $( _inp ).width();
                H = $( _inp ).height();
                T= pos.top ;
                $( errorObject ).empty().css({
                    'left':pos.left+W+30+'px',
                    'top' :T+'px'
                });
            }
            _inpParent.appendChild( errorObject );
            errorObject.innerHTML = error ;
            // if errorClose is activated, create the element which use to close the error window
            if( this.options.errorClose ){
                var errorCloseObject = document.createElement( 'span' );
                errorCloseObject.innerHTML = 'x';
                errorCloseObject.className = this.options.errorCloseClass ;
                errorObject.appendChild( errorCloseObject );
            }
            // we have an error so we need to break submit
            // set to handler true
            this.handler = true ;
        },
        /**
         * @property : close
         * @params _inp : the error message window which will be disappear
         */
        close : function( _inp ){
            _inp.parentNode.removeChild( _inp );
            // set to handler false
            // otherwise at the next validation attempt, submit will not continue even the validation is successful
            this.handler = false ;
        }
    };
    /**
     * @method reset
     *   removes all error messages windows
     * @param {object} or {void} _inp : form elements which have an error message window
     */
    Validetta.prototype.reset = function( _inp ){
        var _errorMessages = {} ;
        // if _inp is undefined ( This is the process of resetting all <form> )
        // or _inp is an object that has element more than one
        // and these elements are not checkbox
        if( typeof _inp === 'undefined' || ( _inp.length > 1 && _inp[0].getAttribute('type') !== 'checkbox' ) ){
            _errorMessages = $(this.form).find( '.'+ this.options.errorClass );
        }
        else {
            _errorMessages = $(_inp[0].parentNode).find( '.'+this.options.errorClass );
        }
        for(var i = _errorMessages.length -1; i >= 0; i--){
            this.window.close.call( this, _errorMessages[i] );
        }
    };
    /**
     * @method clear
     *   Clears the left and right spaces of parameter.
     * @param {string} value
     * @return {String}
     */
    Validetta.prototype.clear = function( value ){
      return value.replace( /^\s+|\s+$/g, '' );
    };
    /**
     * @method ajax
     *   Ajax requests are done here.
     * @return {Void}
     */
    Validetta.prototype.ajax = function(){
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
     * Plugin Validetta
     * @param {object} options : User-specified settings
     * @return {object} this
     */
    $.fn.validetta = function (options){
        if( $.validettaLanguage ){
            messages = $.extend( true, {}, messages, $.validettaLanguage.messages );
        }
        return this.each( function(){
            new Validetta( this, options );
            return this ;
        });
    };
})(jQuery);