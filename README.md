
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

## How to use ?

```javascript
document.addEventListener("DOMContentLoaded", function() {}
  var validettaOptions = {
    realTime: true
  };
  new Validetta(document.getElementById('form'), validettaOptions);
}
```

```html
  <input type="text" name="exm" data-validetta="required,minLength[2],maxLength[3]" />
```

## Browser support

The project is tested in Chrome and Firefox. It should work in the current stable releases of Chrome, Firefox, Safari as well as IE10 and up.

## Dependencies

[classList](https://github.com/components/classList.js) (for ie9 support)

## License

MIT licensed

## Documentation

For a Getting started guide, Options and Defaults, Validators, etc. [check out our docs](docs/)!
