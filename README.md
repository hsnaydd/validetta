# Validetta

Client-side validation of your forms.

98% indebted to [the original plugin.](http://lab.hasanaydogdu.com/validetta)

## Usage
```
$(function(){
	$('#my-form').validetta(options, customMessages);
});
```
### Options

```
var options = {
  showErrorMessages : true,
  // Whether or not to show error messages

  inputWrapperClass : 'form-field',
  // Class of the parent container we want to append the error message to

  errorTemplateClass : 'form-inline-message',
  // Class of the error message string

  errorClass : 'form-field-invalid',
  // Class added to parent of each failing validation field

  validClass : 'form-field-valid',
  // Class added to parent of each successful validation field

  realTime: false,
  // Enable real-time form control, rather than waiting until submit

  onValid: function(){},
  // Callback on submit if the form passes validation

  onError: function(){},
  // Callback on submit if the form fails validation

  validators: {},
  // Any additional custom validators
}
```


### Available validators

| Name | Description |
| --- | --- |
| `required` | Validates on the existence of a value at all. |
| `number` | Validates on whether the value is a number. Additionally, if either a `max` or `min` attribute (or both) exist on the input, it validates on whether the number falls within that range.|
| `email` | Validates an email if it is valid or not, using the regex defined in [this spec](https://html.spec.whatwg.org/multipage/forms.html#states-of-the-type-attribute). |
| `creditCard` | Validates a credit cart number |
| `equalTo[input_name]` | Returns valid if the the two fields are equal to each other. |
| `different[input_name]` | Returns valid if the the two fields are _not_ equal to each other. |
| `minLength[x]` | Returns valid if the value has a min-length of x. |
| `maxLength[x]` | Returns valid if the value has a max-length of x. |
| `minChecked[x]` | (for checkboxes) Returns valid if the number of inputs checked is greater than x. |
| `maxChecked[x]` | (for checkboxes) Returns valid if the number of inputs checked is less than x. |
| `minSelected[x]` | (for select-multiple) Returns valid if the number of options selected is greater than x. |
| `maxSelected[x]` | (for select-multiple) Returns valid if the number of options selected is less than x. |
| `regExp[validator_name]` | Validates on whether a value matches against a supplied regex expression or not. (check the [original docs](http://lab.hasanaydogdu.com/validetta/#documentation))|
| `remote[validator_name]` | Validates using a remote validator (check the [original docs](http://lab.hasanaydogdu.com/validetta/#documentation)) |
| `custom[validator_name]` | Validates based on a function defined in the `validators: {}` plugin option |

#### A note about selects

For `<input type="select">` to work with the required validator, you'll need to add a dummy option with an empty value like so: `<option disabled selected value="">Pick one...</option>`. Otherwise it will pull the first option value and assume the input is valid.

### Defining validators

add a `data-validates=""` attribute to your input, with a comma-separated list of validators.

```
<input name="my_email" type="email" data-validates="required,email">

<input name="my_password" type="password" data-validates="required" placeholder="enter your new password">

<input name="my_password_again" type="password" data-validates="required,equalTo[my_password]" placeholder="enter your new password again">
```

### Custom error messages

To override the default error messages, pass an object as the second argument to Validetta. Here are the available messages and their defaults:
```
var customMessages = {
  required  : 'This field is required.',
  email     : 'Your E-mail address appears to be invalid.',
  number    : 'You can enter only numbers in this field.',
  numMax    : 'Please enter a number less than {max}.',
  numMin    : 'Please enter a number greater than {min}.',
  numRange  : 'Please enter a number greater than {min} and less than {max}.',
  maxLength : 'Maximum {count} characters allowed.',
  minLength : 'Minimum {count} characters allowed.',
  maxChecked  : 'Maximum {count} options allowed.',
  minChecked  : 'Please select minimum {count} options.',
  maxSelected : 'Maximum {count} selection allowed.',
  minSelected : 'Minimum {count} selection allowed.',
  notEqual    : 'Fields do not match.',
  different   : 'Fields cannot be the same as each other',
  creditCard  : 'Invalid credit card number.',
};
```

You can also define a custom message inline, with `data-vd-message[validator_name]`:

```
<input type="text" data-validates="minLength[30]" data-vd-message-minLength="Whoa whoa that's way too short!">
```

For the number validator, the strings `{min}` and `{max}` will be replaced appropriately.



### More detailed documentation
[Original Documentation is here](http://lab.hasanaydogdu.com/validetta/#documentation), with some demos. These still mostly apply. They are also written in charmin broken english.


## Further development
The plugin is built with gulp and includes a demo server for ease of development/testing:

```
$ npm install -g gulp
$ cd path_to_repo
$ npm install
```

`gulp build` should be run before each version bump. Or all the time. Or maybe we need a develop branch, I am not sure

`gulp serve` will spin up a demo server with browsersync.

### Todos
 - Pull more validation rules from native html attributes rather than data-attributes (`required`, `type="email"` etc)
 - More documentation here as to what is different from the root repo

## License

MIT licensed
