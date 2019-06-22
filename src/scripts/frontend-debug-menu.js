/* eslint-disable */

const css = `
  .js-debug-menu {
    display: none;
    width: 220px;
    position: fixed;
    top: 60px;
    left: -200px;
    box-sizing: border-box;
    padding: 12px 5px 12px 40px;
    background-color: rgba(255, 255, 255, 0.75);
    z-index: 100;
    font-size: 14px;
    line-height: 20px;
    border: thin solid #ccc;
    border-radius: 0 10px 10px 0;
  }
  .js-debug-menu:hover {
    left: 0;
  }
  .js-debug-menu a {
    color: black;
    display: inline-block;
  }
  .js-debug-menu li {
    position: relative;
    cursor: pointer;
  }
  .js-debug-menu li li {
    padding: 5px;
  }
  .js-debug-menu li::before {
    content: none;
  }
  .js-debug-menu li:hover {
    font-weight: bold;
  }
  .js-debug-menu__section {
    display: none;
    font-weight: normal;
    padding: 5px 10px;
  }
  li.open .js-debug-menu__section {
    display: block;
  }
  .js-debug-menu__list > li {
    margin: 0;
    padding: 5px 0;
  }
  .js-debug-menu .deprecated::after {
    display: block;
    position: absolute;
    content: 'old';
    top: 2px;
    left: -30px;
    transform: rotate(-45deg);
    color: red;
    font-weight: bold;
  }
  .js-debug-menu .new::after {
    display: block;
    position: absolute;
    content: 'new';
    top: 2px;
    left: -30px;
    transform: rotate(-45deg);
    color: green;
    font-weight: bold;
  }
  .js-debug-menu__close {
    position: absolute;
    right: 5px;
    top: 4px;
    font-size: 24px;
    cursor: pointer;
    padding: 5px;
  }
  .js-debug-menu.open {
    display: block;
  }
`;

fetch('assets/other/debug-menu-data.json')
  .then(response => response.json())
  .then(data => {
    const menu = generateMenu(data);
    const style = document.createElement('style');
    style.innerHTML = css;

    document.querySelector('body').appendChild(menu);
    document.querySelector('body').insertBefore(style, menu);
  });

function generateMenu(data) {
  let menu = '<div class="js-debug-menu open">';
  menu += '<ul class="js-debug-menu__list">';

  for (const item of data) {
    if (item.items) {
      menu += `<li class="${item.mod ? item.mod : ''}" 
                   onclick="this.classList.toggle('open')"
               >${item.title} ▾`;
      menu += '<ul class="js-debug-menu__section">';

      for (const it of item.items) {
        menu += `<li class="${it.mod ? it.mod : ''}"><a href="${it.link}">${it.title}</a></li>`;
      }

      menu += '</ul>';
      menu += '</li>';
    } else {
      menu += `<li class="${item.mod ? item.mod : ''}"><a href="${item.link}">${
        item.title
      }</a></li>`;
    }
  }

  menu += '</ul>';
  menu += `<div class="js-debug-menu__close" 
                onclick="document.querySelector('.js-debug-menu').classList.toggle('open')"
           >×</div>`;
  menu += '</div>';

  const div = document.createElement('div');
  div.innerHTML = menu;

  return div;
}
