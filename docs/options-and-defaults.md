# Options & Defaults

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
