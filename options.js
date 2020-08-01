function restore_options() {
  chrome.storage.sync.get(
    {
      src_lang: "es",
      user_lang: "en",
      token: "",
      auto_translate: true,
    },
    function (items) {
      document.querySelector('select[name="src_lang"]').value = items.src_lang;
      document.querySelector('select[name="user_lang"]').value =
        items.user_lang;
      document.querySelector('input[name="auto_translate"]').checked =
        items.auto_translate;
      document.querySelector('input[name="token"]').value =
        items.token;
    }
  );
}

function save_options() {
  function get_value(type, name) {
    return document.querySelector(type + '[name="' + name + '"]').value;
  }

  chrome.storage.sync.set({
    src_lang: get_value("select", "src_lang"),
    user_lang: get_value("select", "user_lang"),
    auto_translate: get_value("input", "auto_translate"),
    token: get_value("input", "token"),
  });
}

function add_save_event(type, name) {
  document
    .querySelector(type + '[name="' + name + '"]')
    .addEventListener("change", save_options);
}

add_save_event("select", "src_lang");
add_save_event("select", "user_lang");
add_save_event("input", "auto_translate");
add_save_event("input", "token");

document.addEventListener("DOMContentLoaded", restore_options);
