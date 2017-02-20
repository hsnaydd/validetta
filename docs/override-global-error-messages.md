# Override global error messages
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
