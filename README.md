
# Validetta

Validetta is a tiny JavaScript library which you can do client-side validation of your forms. It aims to decrease your burden with easy usage and flexible structure.

[View Demos](http://lab.hasanaydogdu.com/validetta/#examples)

## What can be done?

* You can check fields whether it is empty or not or it is chosen or not.
* You can do e-mail check.
* You can do number check.
* You can check if the two fields are equal to each other.
* You can check credit card number validation.
* You can limit number of characters written to fields.
* You can limit number of choice of multiple select box or check box.
* You can use remote validator.
* By creating your own regular expression, you can check fields according to this regular expression.

## Browser support

The project is tested in Chrome and Firefox. It should work in the current stable releases of Chrome, Firefox, Safari as well as IE10 and up.

## Dependencies

[classList](https://github.com/components/classList.js) (for ie9 support)

## License

MIT licensed

## How does it work?
It is sufficient to copy downloaded validetta folder to root folder and attach essential folders to your web page. You don’t need to copy validetta folder to root folder but those are applied in the following expression as if validetta is copied to root folder.

include the dependent libraries and css files

```html
<link href="validetta/validetta.css" rel="stylesheet" type="text/css" media="screen" >

<script type="text/javascript" src="validetta/validetta.js"></script>
```
You can include language file if you want.

```html
<script type="text/javascript" src="validetta/localization/validettaLang-tr-TR.js"></script>
```

> **Note:**
> The language file must be added before the plugin script!

If you wonder full list of language packages, Check [localization](https://github.com/hsnayd/validetta/tree/master/localization) folder.

After include validetta to project, you will only need to call the plugin in your javascript file;

```javascript
document.addEventListener("DOMContentLoaded", function() {}
    var validettaOptions = {
        realTime: true
    };
    new Validetta(document.getElementById('form'), validettaOptions);
}
```
and add `data-validetta` attribute to element which you want to control.

```html
    <input type="text" name="exm" data-validetta="required,minLength[2],maxLength[3]" />
```

### Validators

| Name                    | Description                                                                   |
|-------------------------|-------------------------------------------------------------------------------|
| required                | Checks fields whether it is empty or not or it is chosen or not.              |
| number                  | Checks fields if it is consist of number or not.                              |
| email                   | Checks email if it is valid or not.                                           |
| creditCard              | Checks credit card number written to fields if it is valid or not.            |
| equalTo[input_name]     | Checks if the two fields are equal to each other according to input name.     |
| different[input_name]   | Checks if the two fields are different to each other according to input name. |
| minLength[x]            | Checks fields if it is consist of minimal X character.                        |
| maxLength[x]            | Checks maximal X character entry to the area.                                 |
| minChecked[x]           | Checks minimal X option if it is marked or not.                               |
| maxChecked[x]           | Checks maximal X option if it is marked or not.                               |
| minSelected[x]          | Checks minimal X option if it is chosen or not.                               |
| maxSelected[x]          | Checks maximal X option if it is chosen or not.                               |
| patter[validator_name]  | Checks if field is suits to identified ordered expression or not.             |
| remote[validator_name]  | Checks fields using remote validator.                                         |
| callback[callback_name] | Return the validity from a callback method                                    |

> Warning!
> Validator arguments ( e.g. `input_name`, and `validator_name` ) should be any word character ( letter, number, undercore ).

### Options & Defaults

```javascript
new validetta(document.getElementById('form'), {
    // If you dont want to display error messages set this options false
    showErrorMessages: true,
    // Error Template: <span class="errorTemplateClass">Error messages will be here !</span>
    // Error display options, (bubble|inline)
    display: 'bubble',
    // Class of the element that would receive error message
    errorTemplateClass: 'validetta-bubble',
    // Class that would be added on every failing validation field
    errorClass: 'validetta-error',
    // Same for valid validation
    validClass: 'validetta-valid',
    // Bubble position (right|left|top|bottom)
    bubblePosition: 'right',
    // Gap the x-axis
    bubbleGapX: 15,
    // Gap the y-axis
    bubbleGapY: 0,
    // To enable real-time form control, set this option true.
    realTime: false,
    realTimeEvents: 'change blur',
    // This function to be called when the user submits the form and there is no error.
    onValid: function() {},
    // This function to be called when the user submits the form and there are some errors
    onError: function() {},
    // Custom validators stored in this variable
    validators: {}
});
```

### Data Attribute Settings

| Attribute                                     | Description                                                                                                                                                                    |
|-----------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| data-vd-parent-up="{count}"                   | This feature allows you to change the element which to be added error,messages. When you working with customized inputs or selectboxes this,feature will be beneficial to you. |
| data-vd-message-[type]="Custom error message" | This allows you to change error messages via data attribute.

### Callbacks
There are two different callbacks you can declare when setting up the validation.

 - **onValid:** This function to be called when the user submits the form and there is no error.
 - **onError:** This function to be called when the user submits the form and there are some errors.

```javascript
new validetta(document.getElementById('form'), {
  onValid: function(event) {
    event.preventDefault(); // Will prevent the submission of the form
    alert( 'Nice, Form is valid.' );
  },
  onError: function(event){
    alert( 'Stop bro !! There are some errors.');
  }
});
```

### Getting invalid fields
Returns the list of invalid fields as an object, containing the properties "field" and "errors".

```javascript
new validetta(document.getElementById('form'), {
  onError : function( event ){
    // this -> form object
    var invalidFields = this.getInvalidFields();
  }
});
```

### Remote Validation
This option allows you to perform server-side validation. By using this option you can validate the value given by the user on server side before the form gets submitted. The validation function will send an ajax request to URL declered in remote options.

The form will get the class validetta-pending while the server is being requested.

> **Note:**
> The response from the ajax request must be a JSON formatted object, containing the properties "valid" and "message".

#### Remote validator settings

```javascript
new validetta(document.getElementById('form'), {
  validators: {
    remote: {
      validator_name: {
        type: 'POST',
        url : 'remote.php'
      }
    }
  }
});
```

#### An example for remote.php

```php
<?php
$response = array('valid' => false, 'message' => 'Sorry, Something went wrong!');

if(isset($_POST['username'])) {
  if ($_POST['username'] !== 'validetta') {
    $response = array( 'valid' => false, 'message' => 'This username is already taken!' );
  } else {
    $response = array('valid' => true);
  }
}
echo json_encode($response);
```

> **Note:**
> Remote validation request fires if does not have any client-side error in the field!

### Override global error messages
Sometimes, you may want to edit error messages, instead of including the language file.

```javascript
new validetta(document.getElementById('form'),
  {
    realTime: true
  },
  {
    required  : 'Custom error message.'
  }
);
```

Scss Variables

| Name                             | Description                                                |
|----------------------------------|------------------------------------------------------------|
| $validetta-font-size             | Font size of the error message                             |
| $validetta-line-height           | Line height of the error message                           |
| $validetta-font-family           | Font family of the error message                           |
| $validetta-bubble-color          | Font color of the error message in the bubble type         |
| $validetta-bubble-bg-color       | Background color of the error message in the bubble type   |
| $validetta-bubble-radius         | Border radius of the error message in the bubble type      |
| $validetta-bubble-caret-size     | Caret size of the error message in the bubble type         |
| $validetta-bubble-pad-vertical   | Vertical padding of the error message in the bubble type   |
| $validetta-bubble-pad-horizontal | Horizontal padding of the error message in the bubble type |
| $validetta-inline-color          | Font color of the error message in the inline type         |
