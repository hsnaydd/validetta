;(function() {
  "use strict";
  /**
   *  Declare variables
   */
  var Validetta = {}; // Plugin Class
  var FIELDS = {}; // Current fields/fields
  // RegExp for input validate rules
  var RRULE = new RegExp(/^(minChecked|maxChecked|minSelected|maxSelected|minLength|maxLength|equalTo|different|regExp|remote|callback)\[([\w\[\]]{1,25})\]/i);
  // RegExp for mail control method
  // @from ( http://www.whatwg.org/specs/web-apps/current-work/multipage/states-of-the-type-attribute.html#e-mail-state-%28type=email%29 )
  var RMAIL = new RegExp(/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/);
  //RegExp for input number control method
  var RNUMBER = new RegExp( /^[\-\+]?(\d+|\d+\.?\d+)$/ );

  /**
   *  Form validate error messages
   */
  var messages = {
    required    : 'This field is required. Please be sure to check.',
    email       : 'Your E-mail address appears to be invalid. Please be sure to check.',
    number      : 'You can enter only numbers in this field.',
    maxLength   : 'Maximum {count} characters allowed!',
    minLength   : 'Minimum {count} characters allowed!',
    maxChecked  : 'Maximum {count} options allowed. Please be sure to check.',
    minChecked  : 'Please select minimum {count} options.',
    maxSelected : 'Maximum {count} selection allowed. Please be sure to check.',
    minSelected : 'Minimum {count} selection allowed. Please be sure to check.',
    notEqual    : 'Fields do not match. Please be sure to check.',
    different   : 'Fields cannot be the same as each other',
    creditCard  : 'Invalid credit card number. Please be sure to check.'
  };

  /**
   *  Plugin defaults
   */
  var defaults = {
    showErrorMessages : true, // If you dont want to display error messages set this options false
    // Error Template : <span class="errorTemplateClass">Error messages will be here !</span>
    display : 'bubble', // Error display options, // bubble / inline
    errorTemplateClass : 'validetta-bubble', // Class of the element that would receive error message
    errorClass : 'validetta-error', // Class that would be added on every failing validation field
    validClass : 'validetta-valid', // Same for valid validation
    bubblePosition: 'right', // Bubble position // right / bottom
    bubbleGapX: 15, // Gap the x-axis
    bubbleGapY: 0, //  Gap the y-axis
    realTime : false, // To enable real-time form control, set this option true.
    onValid : function(){}, // This function to be called when the user submits the form and there is no error.
    onError : function(){}, // This function to be called when the user submits the form and there are some errors
    validators: {} // Custom validators stored in this variable
  };

  /**
   * Clears the left and right spaces of given parameter.
   * This is the function for string parameter !
   * If parameter is an array, function will return the parameter without trimed
   *
   * @param {string} value
   * @return {mixed}
   */
  var trim = function(value) {
    return typeof value === 'string' ? value.replace(/^\s+|\s+$/g, '') : value;
  };

  /**
   * It finds the number of checked checkbox from the specified nodelist
   * @param  {NodeList} nodes - Checkboxes
   * @return {Number} Number of the checked checbox
   */
  var checkedLength = function(nodes) {
    var _length = 0;
    for (var i = 0; i < nodes.length; i++){
      if (nodes[i].checked) _length++;
    }
    return _length;
  };

  /**
   * It registers the specified listener on nodelist elements
   *
   * @param {NodeList} targets - the target elements to be registered listener
   * @param {String} ev - Event type
   * @param {Function} cb - Listener function
   */
  var addListener = function(targets, ev, fn){
    for (var i = 0; i < targets.length; i++) {
      targets[i].addEventListener(ev, fn);
    }
  };

  /**
   * Merge two object
   *
   * @param  {Object} obj1
   * @param  {Object} obj2
   * @return {Object} merged object
   */
  var mergeObject = function (obj1, obj2) {
    var obj3 = {}, propertyName;
    for (propertyName in obj1) {
      if (obj1.hasOwnProperty(propertyName)) {
        obj3[propertyName] = obj1[propertyName];
      }
    }
    for (propertyName in obj2) {
      if (obj2.hasOwnProperty(propertyName)) {
        obj3[propertyName] = obj2[propertyName];
      }
    }
    return obj3;
  };

  /**
   * Get the value of the element
   *
   * @param  {Node} el - Element
   * @return {String|Array} Element value
   */
  var getElementValue = function(el) {
    var val;
    if(el.type === 'select-multiple') {
      val = [];
      for(var i = 0; i < el.length; i++){
        if (el.options[i].selected) {
          val.push(el.options[i].value);
        }
      }
    } else {
      val = el.value;
    }
    return val;
  };

  /**
   * Trigger Custom Event
   * @param  {Node} elm - DOM Element
   * @param  {String} type - Event type (i.e. 'click')
   * @param  {Boolen} bubbles - Whether the event will bubble up through the DOM or not
   */
  var triggerEvent = function(elm, type, bubbles) {
    // Creating the event
    // All events created as cancelable.
    var event = document.createEvent("HTMLEvents");
    event.initEvent(type, !!bubbles, true ); // event type,bubbling,cancelable
    elm.dispatchEvent(event);
  };

  /**
   * Plugin Class
   *
   * @constructor
   * @param {object} form : <form> element which being controlled
   * @param {object} options : User-specified settings
   * @return {method} events
   */
  Validetta = function(form, options, _messages) {
    if( typeof _messages !== 'undefined' ) {
      messages = mergeObject(messages, _messages);
    }
    /**
     *  Public  Properties
     *  @property {mixed} handler It is used to stop or resume submit event handler
     *  @property {object} options Property is stored in plugin options
     *  @property {object} xhr Stores xhr requests
     *  @property {object} form Property is stored in <form> element
     */
    this.handler = false;
    this.options = mergeObject(defaults, options);
    this.form = form;
    this.xhr = {};
    this.events();
  };

  Validetta.prototype = {

    constructor : Validetta,

    /**
     * Validator
     * {count} which used below is the specified maximum or minimum value
     * e.g if method is minLength and  rule is 2 ( minLength[2] )
     * Output error windows text will be : 'Please select minimum 2 options.'
     *
     * @param {Object} tmp = this.tmp Tmp object for store current field and its value
     * @param {String} val : field value
     */
    validator: {
      required : function(tmp, self) {
        switch (tmp.el.type) {
          case 'checkbox' : return tmp.el.checked || messages.required;
          case 'radio' : return this.radio.call( self, tmp.el ) || messages.required;
          case 'select-multiple' : return tmp.val !== null || messages.required;
          default : return !!tmp.val || messages.required;
        }
      },
      //  Mail check - it checks the value if it's a valid email address or not
      email : function(tmp) {
        return RMAIL.test(tmp.val) || messages.email;
      },
      // Number check
      number : function(tmp) {
        return RNUMBER.test(tmp.val) || messages.number;
      },
      // Minimum length check
      minLength : function(tmp) {
        var _length = tmp.val.length;
        return _length === 0 || _length >= tmp.arg || messages.minLength.replace('{count}', tmp.arg);
      },
      // Maximum lenght check
      maxLength : function(tmp) {
        return tmp.val.length <= tmp.arg || messages.maxLength.replace('{count}', tmp.arg);
      },
      // equalTo check
      equalTo : function(tmp, self) {
        return self.form[tmp.arg].value === tmp.val || messages.notEqual;
      },
      different: function(tmp, self) {
        return self.form[tmp.arg].value !== tmp.val || messages.different;
      },
      /**
       * Credit Card Control
       * @from : http://af-design.com/blog/2010/08/18/validating-credit-card-numbers
       */
      creditCard : function(tmp) {
        if (tmp.val === '') return true; // allow empty because empty check does by required metheod
        var reg, cardNumber, pos, digit, i, sub_total, sum = 0, strlen;
        reg = new RegExp(/[^0-9]+/g);
        cardNumber = tmp.val.replace(reg, '');
        strlen = cardNumber.length;
        if(strlen < 16) return messages.creditCard;
        for(i=0 ; i < strlen ; i++) {
          pos = strlen - i;
          digit = parseInt( cardNumber.substring( pos - 1, pos ), 10 );
          if(i % 2 === 1) {
            sub_total = digit * 2;
            if(sub_total > 9) {
              sub_total = 1 + (sub_total - 10);
            }
          } else {
            sub_total = digit;
          }
          sum += sub_total;
        }
        if(sum > 0 && sum % 10 === 0) return true;
        return messages.creditCard;
      },
      //Checkbox check
      maxChecked : function(tmp, self) {
        var checkboxes = self.form.querySelectorAll('[name="' + tmp.el.name + '"]');
        // we dont want to open an error window for all checkboxes which have same "name"
        if (checkboxes[0] !== tmp.el) return;
        var count =  checkedLength(checkboxes);
        if ( count === 0 ) return;
        return count <= tmp.arg || messages.maxChecked.replace('{count}', tmp.arg);
      },
      minChecked : function(tmp, self) {
        var checkboxes = self.form.querySelectorAll('[name="' + tmp.el.name + '"]');
        if (checkboxes[0] !== tmp.el) return; // same as above
        var count = checkedLength(checkboxes);
        return count >= tmp.arg || messages.minChecked.replace('{count}', tmp.arg);
      },
      //Selectbox check
      maxSelected : function(tmp) {
        if(tmp.val === null) return;
        return tmp.val.length <= tmp.arg || messages.maxSelected.replace('{count}', tmp.arg);
      },
      minSelected : function(tmp) {
        return (tmp.val !== null && tmp.val.length >= tmp.arg) || messages.minSelected.replace('{count}', tmp.arg);
      },
      // Radio
      radio : function(el) {
        var count = this.form.querySelectorAll('[name="'+ el.name +'"]:checked').length;
        return count === 1;
      },
      // Custom reg check
      regExp : function(tmp, self) {
        var _arg = self.options.validators.regExp[tmp.arg],
          _reg = new RegExp(_arg.pattern);
        return _reg.test(tmp.val) || _arg.errorMessage;
      },
      // Remote
      remote : function(tmp) {
        tmp.remote = tmp.arg;
        return;
      },
      // Callback
      callback : function(tmp, self) {
        var _cb = self.options.validators.callback[tmp.arg];
        return _cb.callback(tmp.el, tmp.val) || _cb.errorMessage;
      }
    },

    /**
     * This is the method of handling events
     *
     * @return {mixed}
     */
    events : function(){
      var self = this; // stored this
      // Handle submit event
      this.form.addEventListener('submit', function(e) {
        // fields to be controlled transferred to global variable
        FIELDS = this.querySelectorAll('[data-validetta]');
        return self.init(e);
      });
      // real-time option control
      if(this.options.realTime === true) {
        // handle change event for form elements (without checkbox)
        addListener(this.form.querySelectorAll('[data-validetta]:not([type=checkbox])'), 'change', function(e){
          // field to be controlled transferred to global variable
          FIELDS = [this];
          return self.init(e);
        });

        addListener(this.form.querySelectorAll('[data-validetta][type=checkbox]'), 'click', function(e){
          // fields to be controlled transferred to global variable
          FIELDS = self.form.querySelectorAll('[data-validetta][type=checkbox][name="'+ this.name +'"]');
          return self.init(e);
        });
      }
      // handle <form> reset button to clear error messages
      this.form.addEventListener('reset', function() {
        var dirtyFields = self.form.querySelectorAll('.'+ self.options.errorClass +', .'+ self.options.validClass);
        for (var i = 0; i < dirtyFields.length; i++) {
          dirtyFields[i].classList.remove(self.options.errorClass, self.options.validClass);
        }
        return self.reset();
      });
    },

    /**
     * In this method, fields are validated
     *
     * @params {object} e : event object
     * @return {mixed}
     */
    init : function( e ) {
      // Reset error windows from all elements
      this.reset( FIELDS );
      // Start control each elements
      this.checkFields( e );
      if( e.type !== 'submit' ) return; // if event type is not submit, break
      // This is for when running remote request, return false and wait request response
      else if ( this.handler === 'pending' ) return e.preventDefault();
      // if event type is submit and handler is true, break submit and call onError() function
      else if( this.handler === true ) { this.options.onError.call( this, e ); return e.preventDefault(); }
      else return this.options.onValid.call( this, e ); // if form is valid call onValid() function
    },

    /**
     * Checks Fields
     *
     * @param  {object} e event object
     * @return {void}
     */
    checkFields : function( e ) {
      var self = this; // stored this
      this.invalidFields = [];

      for ( var i = 0, _lengthFields = FIELDS.length; i < _lengthFields; i++ ) {
        // if field is disabled, do not check
        if (FIELDS[ i ].disabled) continue;
        var el = FIELDS[ i ], //current field
          errors = '', //current field's errors
          val = trim(getElementValue(el)), //current field's value
          methods = el.getAttribute('data-validetta').split(','), //current field's control methods
          state; // Validation state
        // Create tmp
        this.tmp = {};
        // store el and val variables in tmp
        this.tmp = { el : el, val : val, parent : this.parents( el ) };
        // Start to check fields
        for (var j = 0, _lengthMethods = methods.length; j < _lengthMethods; j++) {
          // Check Rule
          var rule = methods[ j ].match( RRULE ),
            method;
          // Does it have rule?
          if( rule !== null ) {
            // Does it have any argument ?
            if( typeof rule[2] !== 'undefined' ) this.tmp.arg = rule[2];
            // Set method name
            method = rule[1];
          } else { method = methods[ j ]; }
          // prevent empty validation if method is not required
          if ( val === '' && method !== 'required' && method !== 'equalTo' ) continue;
          // Is there a methot in validators ?
          if(self.validator.hasOwnProperty(method)) {
            // Validator returns error message if method invalid
            state = self.validator[method](self.tmp, self);
            if ( typeof state !== 'undefined' && state !== true ) {
              var _dataMsg = el.getAttribute( 'data-vd-message-' + method );
              if ( _dataMsg !== null ) state = _dataMsg;
              errors += state +'<br/>';
            }
          }
        }
        // Check the errors
        if(errors !== '') {
          this.setInvalidField(el, errors);
          // if parent element has valid class, remove and add error class
          this.addErrorClass(this.tmp.parent);
          // open error window
          this.window.open.call(this , el, errors);
        // Check remote validation
        } else if (typeof this.tmp.remote !== 'undefined') {
          this.checkRemote(el, e);
        } else { // Nice, there are no error
          if( typeof state !== 'undefined' ) this.addValidClass(this.tmp.parent);
          else this.tmp.parent.classList.remove(this.options.errorClass, this.options.validClass );
          state = undefined; // Reset state variable
        }
      }
    },

    /**
     * Checks remote validations
     *
     * @param  {object} el current field
     * @param  {object} e event object
     * @throws {error} If previous remote request for same value has rejected
     * @return {void}
     */
    checkRemote : function( el, e ) {
      var ajaxOptions = {},
        data = {},
        fieldName = el.name || el.id;

      if ( typeof this.remoteCache === 'undefined' ) this.remoteCache = {};

      data[ fieldName ] = this.tmp.val; // Set data
      // exends ajax options
      ajaxOptions = mergeObject({
        data: data
      }, this.options.validators.remote[ this.tmp.remote ] || {} );

      // generate specific cache key
      var cacheKey = fieldName+':'+this.tmp.val;

      // Check cache
      var cache = this.remoteCache[ cacheKey ];

      if ( typeof cache !== 'undefined' ) {
        switch( cache.state ) {
          case 'pending' : // pending means remote request not finished yet
            this.handler = 'pending'; // update handler and cache event type
            cache.event = e.type;
            break;
          case 'rejected' : // rejected means remote request could not be performed
            e.preventDefault(); // we have to break submit because of throw error
            throw new Error( cache.result.message );
          case 'resolved' : // resolved means remote request has done
            // Check to cache, if result is invalid, open an error window
            if ( cache.result.valid === false ) {
              this.addErrorClass( this.tmp.parent );
              this.setInvalidField(el, cache.result.message);
              this.window.open.call( this, el, cache.result.message );
            } else {
              this.addValidClass( this.tmp.parent );
            }
        }
      } else {
        // Abort if previous ajax request still running
        var _xhr = this.xhr[ fieldName ];
        if ( typeof _xhr !== 'undefined' && _xhr.readyState !== 4 ) _xhr.abort();
        // Start caching
        cache = this.remoteCache[ cacheKey ] = { state : 'pending', event : e.type };
        // make a remote request
        this.remoteRequest( ajaxOptions, cache, el, fieldName );
      }
    },

    /**
     * Calls ajax request for remote validations
     *
     * @param  {object} ajaxOptions Ajax options
     * @param  {object} cache Cache object
     * @param  {object} el processing element
     * @param  {string} fieldName Field name for make specific caching
     * @param  {object} e Event object
     */
    remoteRequest : function(ajaxOptions, cache, el, fieldName, e) {

      var self = this;

      this.tmp.parent.classList.add('validetta-pending');

      var xhr = new XMLHttpRequest();
      xhr.open(ajaxOptions.type, ajaxOptions.url, true);

      if (ajaxOptions.type.toUpperCase() === 'POST') {
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
      }

      xhr.onload = function() {
        if (xhr.status >= 200 && xhr.status < 400) {
          // Success!
          var result = xhr.responseText;
          if( typeof result !== 'object' ) result = JSON.parse( result );
            cache.state = 'resolved';
            cache.result = result;
            if ( cache.event === 'submit' ) {
              self.handler = false;
              triggerEvent(self.form, 'submit');
            }
            else if( result.valid === false ) {
              self.addErrorClass( self.tmp.parent );
              self.window.open.call( self, el, result.message );
            } else {
              self.addValidClass( self.tmp.parent );
            }

        } else {
          // We reached our target server, but it returned an error
          if ( xhr.status !== 0 ) { // Dont throw error if request is aborted
            var _msg = 'Ajax request failed for field ('+ fieldName +') : '+ xhr.status +' '+ xhr.statusText;
            cache.state = 'rejected';
            cache.result = { valid : false, message : _msg };
            throw new Error( _msg );
          }

        }
        self.tmp.parent.classList.remove('validetta-pending');
      };

      xhr.onerror = function(e) {
        // There was a connection error of some sort
        var _msg = 'There was a connection error of some sort';
        cache.state = 'rejected';
        cache.result = { valid : false, message : _msg };
        throw new Error(_msg);
      };

      // cache xhr
      this.xhr[ fieldName ] = xhr;
      this.xhr[ fieldName ].send(fieldName+'='+ajaxOptions.data[fieldName]);

      this.handler = 'pending';
    },

    /**
     * This the section which opening or closing error windows process is done
     *
     * @namespace
     */
    window : {
      /**
       * Error window opens
       *
       * @params {object} el : element which has an error ( it can be native element or jQuery object )
       * @params {string} error : error messages
       */
      open : function( el, error ) {
        // We want display errors ?
        if (!this.options.showErrorMessages || el.getAttribute('data-vd-show-error-messages') === 'false') {
          // because of form not valid, set handler true for break submit
          this.handler = true;
          return;
        }
        var elParent = this.parents( el );
        // If the parent element undefined, that means el is an object. So we need to transform to the element
        if( typeof elParent === 'undefined' ) elParent = el[0].parentNode;
        // if there is an error window which previously opened for el, return
        if ( elParent.querySelectorAll( '.'+ this.options.errorTemplateClass ).length ) return;
        // Create the error window object which will be appear
        var errorObject = document.createElement('span');
        errorObject.className = this.options.errorTemplateClass + ' '+this.options.errorTemplateClass + '--' + this.options.bubblePosition;
        // if error display is bubble, calculate to positions
        errorObject.innerHTML = error;
        elParent.appendChild(errorObject);
        if(this.options.display === 'bubble') {
          var X = 0;
          var Y = 0;
          var factorX = this.options.bubblePosition === 'left' ? -1 : 1;
          var factorY = this.options.bubblePosition === 'top' ? -1 : 1;
          switch(this.options.bubblePosition) {
            case 'top':
            case 'bottom':
              Y = el.offsetHeight;
              break;
            case 'left':
              X = errorObject.offsetWidth;
              break;
            default:
              X = el.offsetWidth;
          }
          errorObject.style.top = el.offsetTop + ((Y + this.options.bubbleGapY) * factorY) +'px';
          errorObject.style.left = el.offsetLeft + ((X + this.options.bubbleGapX) * factorX)  +'px';
        }

        // we have an error so we need to break submit
        // set to handler true
        this.handler = true;
      },
      /**
       * Error window closes
       *
       * @params el : the error message window which will be disappear
       */
      close : function( el ) {
        el.parentNode.removeChild( el );
      }
    },


    /**
     * Removes all error messages windows
     *
     * @param {object} or {void} el : form elements which have an error message window
     */
    reset : function( el ) {
      var _errorMessages = {};
      // if el is undefined ( This is the process of resetting all <form> )
      // or el is an object that has element more than one
      // and these elements are not checkbox
      if( typeof el === 'undefined' || ( el.length > 1 && el[0].type !== 'checkbox' ) ) {
        _errorMessages = this.form.querySelectorAll( '.'+ this.options.errorTemplateClass );
      }
      else {
        _errorMessages = this.parents( el[0] ).querySelectorAll( '.'+ this.options.errorTemplateClass );
      }
      for ( var i = 0, _lengthErrorMessages = _errorMessages.length; i < _lengthErrorMessages; i++ ) {
        this.window.close.call( this, _errorMessages[ i ] );
      }
      // set to handler false
      // otherwise at the next validation attempt, submit will not continue even the validation is successful
      this.handler = false;
    },

    /**
     * Adds error class and removes valid class if exist
     *
     * @param {object} el element
     */
    addErrorClass : function( el ) {
      el.classList.remove(this.options.validClass);
      el.classList.add(this.options.errorClass);
    },

    /**
     * Adds valid class and removes error class if exist
     * if error class not exist, do not add valid class
     *
     * @param {object} el element
     */
    addValidClass : function( el ) {
      el.classList.remove(this.options.errorClass);
      el.classList.add(this.options.validClass);
    },

    /**
     * Get invalid Fields
     * @return {Array} Returns invalid fields.
     */
    getInvalidFields: function() {
      return this.invalidFields;
    },

    /**
     * Set invalid field
     * @param {Node} el - the field to be validated
     * @param {String} errors - field's error messages
     */
    setInvalidField: function(el, errors) {
      this.invalidFields.push({field: el, errors: errors});
    },

    /**
     * Finds parent element
     *
     * @param  {object} el element
     * @return {object} el parent element
     */
    parents : function( el ) {
      var upLength = parseInt( el.getAttribute( 'data-vd-parent-up' ), 10 ) || 0;
      for ( var i = 0; i <= upLength ; i++ ) {
        el = el.parentNode;
      }
      return el;
    }
  };
  if(typeof window.VALIDETTA_LANGUAGE !== 'undefined') {
    messages = mergeObject(messages, VALIDETTA_LANGUAGE);
  }

  window.Validetta = Validetta;

})();