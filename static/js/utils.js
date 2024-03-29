/* global NexT, CONFIG */

HTMLElement.prototype.wrap = function (wrapper) {
  this.parentNode.insertBefore(wrapper, this);
  this.parentNode.removeChild(this);
  wrapper.appendChild(this);
};

// https://caniuse.com/#feat=mdn-api_element_classlist_replace
if (typeof DOMTokenList.prototype.replace !== 'function') {
  DOMTokenList.prototype.replace = function (remove, add) {
    this.remove(remove);
    this.add(add);
  };
}

NexT.utils = {
  /**
   * Wrap images with fancybox.
   */
  wrapImageWithFancyBox: function () {
    document
      .querySelectorAll('.post-body :not(a) > img, .post-body > img')
      .forEach((element) => {
        const $image = $(element);
        const imageLink = $image.attr('data-src') || $image.attr('src');
        const $imageWrapLink = $image
          .wrap(
            `<a class="fancybox fancybox.image" href="${imageLink}" itemscope itemtype="http://schema.org/ImageObject" itemprop="url"></a>`
          )
          .parent('a');
        if ($image.is('.post-gallery img')) {
          $imageWrapLink.attr('data-fancybox', 'gallery').attr('rel', 'gallery');
        } else if ($image.is('.group-picture img')) {
          $imageWrapLink.attr('data-fancybox', 'group').attr('rel', 'group');
        } else {
          $imageWrapLink.attr('data-fancybox', 'default').attr('rel', 'default');
        }

        const imageTitle = $image.attr('title') || $image.attr('alt');
        if (imageTitle) {
          $imageWrapLink.append(`<p class="image-caption">${imageTitle}</p>`);
          // Make sure img title tag will show correctly in fancybox
          $imageWrapLink.attr('title', imageTitle).attr('data-caption', imageTitle);
        }
      });

    $.fancybox.defaults.hash = false;
    $('.fancybox').fancybox({
      loop: true,
      helpers: {
        overlay: {
          locked: false,
        },
      },
    });
  },

  registerExtURL: function () {
    document.querySelectorAll('span.exturl').forEach((element) => {
      const link = document.createElement('a');
      // https://stackoverflow.com/questions/30106476/using-javascripts-atob-to-decode-base64-doesnt-properly-decode-utf-8-strings
      link.href = decodeURIComponent(
        atob(element.dataset.url)
          .split('')
          .map((c) => {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join('')
      );
      link.rel = 'noopener external nofollow noreferrer';
      link.target = '_blank';
      link.className = element.className;
      link.title = element.title;
      link.innerHTML = element.innerHTML;
      element.parentNode.replaceChild(link, element);
    });
  },

  /**
   * One-click copy code support.
   */
  registerCopyCode: function () {
    if (!navigator || !navigator.clipboard) return;
    const svgCopy = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><path fill="currentColor" d="M28 10v18H10V10h18m0-2H10a2 2 0 0 0-2 2v18a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2Z"/><path fill="currentColor" d="M4 18H2V4a2 2 0 0 1 2-2h14v2H4Z"/></svg>`;
    const svgCheck = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><path fill="currentColor" d="m14 21.414l-5-5.001L10.413 15L14 18.586L21.585 11L23 12.415l-9 8.999z"/><path fill="currentColor" d="M16 2a14 14 0 1 0 14 14A14 14 0 0 0 16 2Zm0 26a12 12 0 1 1 12-12a12 12 0 0 1-12 12Z"/></svg>`;
    document.querySelectorAll('pre > code').forEach((block) => {
      if (block.children[0].className === 'lnt') return;
      const button = document.createElement('button');
      button.className = 'copy-btn'
      button.type = 'button';
      button.title = 'Copy';
      button.innerHTML = svgCopy;
      button.addEventListener('click', () => {
        navigator.clipboard.writeText(block.innerText).then(
          () => {
            button.blur();
            button.innerHTML = svgCheck;
            block.addEventListener('mouseleave', () => {
              setTimeout(() => button.innerHTML = svgCopy, 300);
            })
          }
        )
      });
      const pre = block.parentNode;
      pre.parentNode.insertBefore(button, pre.nextSibling);
    });
  },

  wrapTableWithBox: function () {
    document.querySelectorAll('table').forEach((element) => {
      const box = document.createElement('div');
      box.className = 'table-container';
      element.wrap(box);
    });
  },

  registerVideoIframe: function () {
    document.querySelectorAll('iframe').forEach((element) => {
      const supported = [
        'www.youtube.com',
        'player.vimeo.com',
        'player.youku.com',
        'player.bilibili.com',
        'www.tudou.com',
      ].some((host) => element.src.includes(host));
      if (supported && !element.parentNode.matches('.video-container')) {
        const box = document.createElement('div');
        box.className = 'video-container';
        element.wrap(box);
        const width = Number(element.width);
        const height = Number(element.height);
        if (width && height) {
          box.style.paddingTop = (height / width) * 100 + '%';
        }
      }
    });
  },

  registerScrollPercent: function () {
    const backToTop = document.querySelector('.back-to-top');
    const readingProgressBar = document.querySelector('.reading-progress-bar');
    // For init back to top in sidebar if page was scrolled after page refresh.
    window.addEventListener('scroll', () => {
      if (backToTop || readingProgressBar) {
        const contentHeight = document.body.scrollHeight - window.innerHeight;
        const scrollPercent =
          contentHeight > 0 ? Math.min((100 * window.scrollY) / contentHeight, 100) : 0;
        if (backToTop) {
          backToTop.classList.toggle('back-to-top-on', Math.round(scrollPercent) >= 5);
          backToTop.querySelector('span').innerText = Math.round(scrollPercent) + '%';
        }
        if (readingProgressBar) {
          readingProgressBar.style.width = scrollPercent.toFixed(2) + '%';
        }
      }
      if (!Array.isArray(NexT.utils.sections)) return;
      let index = NexT.utils.sections.findIndex((element) => {
        return element && element.getBoundingClientRect().top > 0;
      });
      if (index === -1) {
        index = NexT.utils.sections.length - 1;
      } else if (index > 0) {
        index--;
      }
      this.activateNavByIndex(index);
    });

    backToTop &&
      backToTop.addEventListener('click', () => {
        window.anime({
          targets: document.scrollingElement,
          duration: 500,
          easing: 'linear',
          scrollTop: 0,
        });
      });
  },

  /**
   * Tabs tag listener (without twitter bootstrap).
   */
  registerTabsTag: function () {
    // Binding `nav-tabs` & `tab-content` by real time permalink changing.
    document.querySelectorAll('.tabs ul.nav-tabs .tab').forEach((element) => {
      element.addEventListener('click', (event) => {
        event.preventDefault();
        // Prevent selected tab to select again.
        if (element.classList.contains('active')) return;
        // Add & Remove active class on `nav-tabs` & `tab-content`.
        [...element.parentNode.children].forEach((target) => {
          target.classList.toggle('active', target === element);
        });
        // https://stackoverflow.com/questions/20306204/using-queryselector-with-ids-that-are-numbers
        const tActive = document.getElementById(
          element.querySelector('a').getAttribute('href').replace('#', '')
        );
        [...tActive.parentNode.children].forEach((target) => {
          target.classList.toggle('active', target === tActive);
        });
        // Trigger event
        tActive.dispatchEvent(
          new Event('tabs:click', {
            bubbles: true,
          })
        );
      });
    });

    window.dispatchEvent(new Event('tabs:register'));
  },

  registerCanIUseTag: function () {
    // Get responsive height passed from iframe.
    window.addEventListener(
      'message',
      ({ data }) => {
        if (typeof data === 'string' && data.includes('ciu_embed')) {
          const featureID = data.split(':')[1];
          const height = data.split(':')[2];
          document.querySelector(`iframe[data-feature=${featureID}]`).style.height =
            parseInt(height, 10) + 5 + 'px';
        }
      },
      false
    );
  },

  registerLangSelect: function () {
    const selects = document.querySelectorAll('.lang-select');
    selects.forEach((sel) => {
      sel.value = 'zh-cn';
      sel.addEventListener('change', () => {
        const target = sel.options[sel.selectedIndex];
        document.querySelectorAll('.lang-select-label span').forEach((span) => {
          span.innerText = target.text;
        });
        // Disable Pjax to force refresh translation of menu item
        window.location.href = target.dataset.href;
      });
    });
  },

  registerSidebarTOC: function () {
    this.sections = [...document.querySelectorAll('.post-toc li a')].map(
      (element) => {
        const target = document.getElementById(
          decodeURI(element.getAttribute('href')).replace('#', '')
        );
        // TOC item animation navigate.
        element.addEventListener('click', (event) => {
          event.preventDefault();
          const offset = target.getBoundingClientRect().top + window.scrollY;
          window.anime({
            targets: document.scrollingElement,
            duration: 500,
            easing: 'linear',
            scrollTop: offset + 10,
          });
        });
        return target;
      }
    );
  },

  activateNavByIndex: function (index) {
    const target = document.querySelectorAll('.post-toc li a')[index];
    if (!target || target.classList.contains('active-current')) return;

    document.querySelectorAll('.post-toc .active').forEach((element) => {
      element.classList.remove('active', 'active-current');
    });
    target.classList.add('active', 'active-current');
    let parent = target.parentNode;
    while (!parent.matches('.post-toc')) {
      if (parent.matches('li')) parent.classList.add('active');
      parent = parent.parentNode;
    }
    // Scrolling to center active TOC element if TOC content is taller then viewport.
    const tocElement = document.querySelector('.sidebar-panel-container');
    window.anime({
      targets: tocElement,
      duration: 200,
      easing: 'linear',
      scrollTop:
        tocElement.scrollTop -
        tocElement.offsetHeight / 2 +
        target.getBoundingClientRect().top -
        tocElement.getBoundingClientRect().top,
    });
  },

  getComputedStyle: function (element) {
    const clone = element.cloneNode(true);
    clone.style.position = 'absolute';
    clone.style.visibility = 'hidden';
    clone.style.display = 'block';
    element.parentNode.appendChild(clone);
    const height = clone.clientHeight;
    element.parentNode.removeChild(clone);
    return height;
  },

  /**
   * Init Sidebar & TOC inner dimensions on all pages and for all schemes.
   * Need for Sidebar/TOC inner scrolling if content taller then viewport.
   */
  initSidebarDimension: function () {
    const sidebarNav = document.querySelector('.sidebar-nav');
    const sidebarb2t = document.querySelector('.sidebar-inner .back-to-top');
    const sidebarNavHeight = sidebarNav ? sidebarNav.offsetHeight : 0;
    const sidebarb2tHeight = sidebarb2t ? sidebarb2t.offsetHeight : 0;
    const sidebarOffset = 12;
    let sidebarSchemePadding = 18 * 2 + sidebarNavHeight + sidebarb2tHeight;
    sidebarSchemePadding += sidebarOffset * 2;
    // Initialize Sidebar & TOC Height.
    const sidebarWrapperHeight = document.body.offsetHeight - sidebarSchemePadding + 'px';
    document.documentElement.style.setProperty(
      '--sidebar-wrapper-height',
      sidebarWrapperHeight
    );
  },

  updateSidebarPosition: function () {
    NexT.utils.initSidebarDimension();
    if (window.screen.width < 992 || true) return;
  },
};
