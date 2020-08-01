(function () {
  let translated = [];
  let alltries = [];

  let config = {
    launched: false,

    user: {},

    mainWrap: "translate-ext",
    subtitleWrap: "subtitle-wrap",

    translatedSentence: "sent-tr-open",

    translationWrap: "translation-wrap",
    openRightPanel: "open-tr-panel",
    closeRightPanel: "tr-close-x",

    imgWrap: "img-tr-wrap",
    imgWrapTitle: "img-tr-tile",

    dsecriptionWrap: "describe-tr-wrap",
    dsecriptionTitle: "describe-tr-title",

    mainTranslateId: "translate-ext-main-tr",
    mainTranslateOpenClass: "open-bg-tr",
  };

  function get_options() {
    chrome.storage.sync.get(
      {
        src_lang: "es",
        user_lang: "en",
        auto_translate: true,
        token: "",
      },
      function (items) {
        config.user = items;
      }
    );
  }

  function createTapeWrap() {
    let frameDiv = document.createElement("div");
    frameDiv.id = config.mainWrap;
    document.body.appendChild(frameDiv);

    let subDiv = document.createElement("div");
    subDiv.id = config.subtitleWrap;
    document.querySelector("#" + config.mainWrap).appendChild(subDiv);

    let wordDiv = document.createElement("div");
    wordDiv.id = config.translationWrap;
    document.querySelector("#" + config.mainWrap).appendChild(wordDiv);

    document.querySelector("#" + config.translationWrap).innerHTML =
      '<div id="' +
      config.closeRightPanel +
      '"></div><div class="tr-title"  id="' +
      config.dsecriptionTitle +
      '"></div>\n\
				   <div id="' +
      config.dsecriptionWrap +
      '">\n</div>\n\
				   <div class="tr-title" id="' +
      config.imgWrapTitle +
      '"></div> \n\
				   <div id="' +
      config.imgWrap +
      '"></div>  \n\
	  ';

    let centerTranslateDiv = document.createElement("div");
    centerTranslateDiv.id = config.mainTranslateId;
    document.body.appendChild(centerTranslateDiv);
  }
  createTapeWrap();

  function translateApi(text, calback) {
    fetch("https://translation.googleapis.com/language/translate/v2", {
      method: "POST",
      body: JSON.stringify({
        q: text,
        source: config.user.src_lang,
        target: config.user.user_lang,
        format: "text",
      }),
      headers: {
        Authorization: `Bearer ${config.user.token}`,
        "Content-Type": "application/json; charset=utf-8",
      },
    })
      .then(function (res) {
        if (res.status >= 200 && res.status < 300) {
          return Promise.resolve(res);
        } else {
          return Promise.reject(new Error(res.statusText));
        }
      })
      .then(function (res) {
        return res.json();
      })
      .then(function (data) {
        return calback(data);
      })
      .catch(function (err) {
        console.log("Fetch Error :-S", err);
      });
  }

  function subtitleSentence() {
    let self;
    return {
      add: function (subtitle) {
        var el = document.querySelector(
          "#" + config.mainWrap + " #" + config.subtitleWrap
        );
        el.insertAdjacentHTML(
          "beforeend",
          "<dl><dt>" +
            subtitle.replace(/([A-zÀ-ú'\-]+)/gi, "<span>$1</span>") +
            "</dt><dd></dd></dl>"
        );

        self = this;
        let bdclist = document.querySelector("body").classList;
        // check that the panel is open
        if (config.user.auto_translate && bdclist.contains("open-tr-panel"))
          self.translateSentence(el.lastChild);
        self.scroll();
        self.addClickListner();
      },
      scroll: function () {
        let elm = document.querySelector(
          "#" + config.mainWrap + " #" + config.subtitleWrap
        );
        if (elm.offsetHeight + elm.scrollTop + 150 > elm.scrollHeight) {
          elm.scrollIntoView();
        }
      },
      addClickListner: function () {
        let nodes = document.querySelectorAll(
          "#" + config.mainWrap + " #" + config.subtitleWrap + " dl"
        );
        nodes[nodes.length - 1].addEventListener(
          "click",
          self.clickedWordORSent
        );
      },
      clickedWordORSent: function (event) {
        if (event.target.nodeName === "SPAN") {
          return translatePanel().start(event.target.textContent);
        } else {
          return self.translateSentence(event.target);
        }
      },
      translateSentence: function (el) {
        let sentence = el.textContent.toLowerCase();

        if (sentence == "") return false;

        if (el.nodeName !== "DL")
          while ((el = el.parentElement) && !el.nodeName === "DL");

        if (typeof el == "undefined") {
          return false;
        }

        if (el.classList.contains(config.translatedSentence)) {
          return false;
        }

        el.classList.add(config.translatedSentence);

        translateApi(sentence, function (data) {
          var ddtarget = el.querySelector("dd");
          ddtarget.textContent = data.data.translations[0].translatedText;
          ddtarget.scrollIntoView();
        });
      },
    };
  }

  function translatePanel(word) {
    let self;
    return {
      start: function (word) {
        self = this;
        document
          .querySelector("#" + config.mainWrap)
          .classList.add(config.openRightPanel);

        document.querySelector("#" + config.dsecriptionTitle).innerHTML =
          "<span>" + word + "</span>";

        document.querySelector("#" + config.imgWrap).textContent = "";

        translateApi(word, this.wordTranslate);

        self.close();
      },
      close: function () {
        document.querySelector("#" + config.closeRightPanel).addEventListener(
          "click",
          function (e) {
            document
              .querySelector("#" + config.mainWrap)
              .classList.remove(config.openRightPanel);
          },
          false
        );
        document.querySelector("#" + config.translationWrap).addEventListener(
          "click",
          function (e) {
            document
              .querySelector("#" + config.mainWrap)
              .classList.remove(config.openRightPanel);
          },
          false
        );
      },
      wordTranslate: function (data) {
        document.querySelector(
          "#" + config.mainWrap + " #" + config.dsecriptionWrap
        ).innerHTML = "";

        if (data.data.translations[0].translatedText) {
          document
            .querySelector("#" + config.dsecriptionTitle)
            .insertAdjacentHTML(
              "beforeend",
              " — " + data.data.translations[0].translatedText
            );
        }
      },
    };
  }

  function run(item) {
    config.launched = true;
    get_options();

    let query = "";
    let queryBefore = "";
    let wait = false;
    let subtitleBefore = "";
    item.addEventListener(
      "DOMNodeInserted",
      function (e) {
        if (wait) {
          return false;
        }
        wait = true;
        let subtitle = "";

        setTimeout(function () {
          wait = false;
          try {
            let firstSub = item.querySelector("span").textContent;
            item.querySelectorAll("span").forEach(function (span) {
              subtitle += span.textContent + " ";
            });
          } catch (e) {
            return false;
          }

          if (subtitle == subtitleBefore) {
            return false;
          }

          subtitleSentence().add(subtitle);
          subtitleBefore = subtitle;
        }, 100);
      },
      false
    );
  }

  let intv = setInterval(function () {
    let item = document.querySelector(".player-timedtext");
    if (
      item &&
      document.querySelector(".PlayerControlsNeo__button-control-row")
    ) {
      if (!config.launched) {
        run(item);
      }
    } else {
      config.launched = false;
      document.querySelector(
        "#" + config.mainWrap + " #" + config.subtitleWrap
      ).innerHTML = "";
    }
  }, 500);

  chrome.storage.local.get(["is_open"], function (result) {
    let bdclist = document.querySelector("body").classList;
    if (result.is_open) bdclist.add("open-tr-panel");
  });
})();

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.buttonClick) {
    if (!window.location.href.match(/.+:\/\/.+netflix\.com\/watch\//)) {
      return false;
    }
    //toggle
    let bdclist = document.querySelector("body").classList;
    const is_open = bdclist.contains("open-tr-panel");
    chrome.storage.local.set({ is_open: !is_open });

    is_open ? bdclist.remove("open-tr-panel") : bdclist.add("open-tr-panel");
  }
  return true;
});
