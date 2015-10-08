$(function() {
  var $form =  $('#validate-me');

  $form.attr('novalidate', true);

  $('#validate-me').validetta({
    errorTemplateClass: 'form-inline-message',
    errorClass : 'form-input-error',
    validClass : 'form-input-valid'
  });
});
