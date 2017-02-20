# Remote Validation
This option allows you to perform server-side validation. By using this option you can validate the value given by the user on server side before the form gets submitted. The validation function will send an ajax request to URL declered in remote options.

The form will get the class validetta-pending while the server is being requested.

> **Note:**
> The response from the ajax request must be a JSON formatted object, containing the properties "valid" and "message".

## Remote validator settings

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

## An example for remote.php

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
