# Getting started
It is sufficient to copy downloaded validetta folder to root folder and attach essential folders to your web page. You don’t need to copy validetta folder to root folder but those are applied in the following expression as if validetta is copied to root folder.

include the dependent libraries and css files

```html
<link href="validetta/validetta.css" rel="stylesheet" type="text/css" media="screen" >

<script type="text/javascript" src="validetta/validetta.js"></script>
```
You can include language file if you want.

```html
<script type="text/javascript" src="validetta/localization/validettaLang-tr-TR.js"></script>
```

> **Note:**
> The language file must be added before the plugin script!

If you wonder full list of language packages, Check [localization](../localization) folder.

After include validetta to project, you will only need to call the plugin in your javascript file;

```javascript
document.addEventListener("DOMContentLoaded", function() {}
  var validettaOptions = {
    realTime: true
  };
  new Validetta(document.getElementById('form'), validettaOptions);
}
```
and add `data-validetta` attribute to element which you want to control.

```html
  <input type="text" name="exm" data-validetta="required,minLength[2],maxLength[3]" />
```
