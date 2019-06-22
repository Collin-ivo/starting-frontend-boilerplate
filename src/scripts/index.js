/* eslint-disable */

import jQuery from './vendor/jquery-3.2.1';

window.jQuery = window.$ = jQuery;

(() => {

  // не забыть удалить
  const hello = (input) => {
    console.log(input);
  };
  hello('Page is Ready');

})();

