# Validators

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
| pattern[validator_name] | Checks if field is suits to identified ordered expression or not.             |
| remote[validator_name]  | Checks fields using remote validator.                                         |
| callback[callback_name] | Return the validity from a callback method                                    |

> Warning!
> Validator arguments ( e.g. `input_name`, and `validator_name` ) should be any word character ( letter, number, undercore ).
