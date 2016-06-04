
String.prototype.hashCode = function(){
  var hash = 0;
  if (this.length === 0) return hash;
  for (i = 0; i < this.length; i++) {
    char = this.charCodeAt(i);
    hash = ((hash << 5 )-hash)+char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash;
};

function isValidEmailAddress(emailAddress) {
  var pattern = new RegExp(/^[+a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/i);
  // alert( pattern.test(emailAddress) );
  return pattern.test(emailAddress);
}


function validateEmailAddress(parentElement, email) {

  console.log('parentElement', parentElement);
  if( email === '' ){

    parentElement.find("input[name='user-email']").addClass("error");

    parentElement.find(" .errorText").addClass("show").removeClass("hide").html('Email is Mandatory');

    return false;

  } if( !isValidEmailAddress(email) ){
    console.log('email', email);
    parentElement.find(" input[name='user-email']").addClass("error");

    parentElement.find(" .errorText").addClass("show").removeClass("hide").html('Please enter valid email address');

    return false;

  } else {

    parentElement.find(" input[name='user-email']").removeClass("error");

    parentElement.find(" .errorText").addClass("hide").removeClass("show");

    return true;
  }
}


function validatePassword(parentElement, password) {
  if( password === ''){

    parentElement.find(" input[name='user-pw']").addClass("error");

    parentElement.find(" .errorText").addClass("show").removeClass("hide").html('Password is Mandatory');

    return false;

  } else {

    parentElement.find(" input[name='user-pw']").removeClass("error");

    parentElement.find(" .errorText").addClass("hide").removeClass("show");

    return true;
  }
}

function validateSecondPassword(parentElement, password, passwordRepeat) {
  if( password !== passwordRepeat){

    parentElement.find(" input[name='user-pw']").addClass("error");
    parentElement.find(" input[name='user-pw-repeat']").addClass("error");

    parentElement.find(" .errorText").addClass("show").removeClass("hide").html('Password are not matching');

    return false;

  } else {

    parentElement.find(" input[name='user-pw']").removeClass("error");
    parentElement.find(" input[name='user-pw-repeat']").removeClass("error");

    parentElement.find(" .errorText").addClass("hide").removeClass("show");

    return true;
  }
}
