<?php
$response = array( 'valid' => false, 'message' => 'Sorry, Something went wrong!');
if( isset($_POST['exm3-name']) ) {

  if ( $_POST['exm3-name'] !== 'validetta' ) {
    $response = array( 'valid' => false, 'message' => 'This username is already taken!' );
  } else {
    $response = array( 'valid' => true );
  }

}

echo json_encode($response);