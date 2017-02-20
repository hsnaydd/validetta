# Getting invalid fields
Returns the list of invalid fields as an object, containing the properties "field" and "errors".

```javascript
new validetta(document.getElementById('form'), {
  onError : function( event ){
    // this -> form object
    var invalidFields = this.getInvalidFields();
  }
});
```
