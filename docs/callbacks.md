# Callbacks
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
