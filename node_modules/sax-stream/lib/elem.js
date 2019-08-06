function child(el, path) {
  var name;

  if (!el) {
    return;
  }
  if (Array.isArray(el)) {
    el = el[0];
  }
  if (!Array.isArray(path)) {
    path = path.split('/');
  }
  name = path.shift();
  if (!el.children) {
    return;
  }
  el = el.children[name];
  if (path.length) {
    return child(el, path);
  }
  return el;
}

function value(el, path) {
  el = child(el, path);
  return el && el.value;
}

function attr(el, path, name) {
  el = child(el, path);
  return el && el.attribs && el.attribs[name];
}

function addChild(parent, name) {
  var child = {
    parent: parent
  };
  parent.children = parent.children || {};
  if (!parent.children[name]) {
    parent.children[name] = child;
  } else {
    if (!Array.isArray(parent.children[name])) {
      parent.children[name] = [parent.children[name]];
    }
    parent.children[name].push(child);
  }
  return child;
}

function addText(node, text) {
  node.value = text;
  return node;
}

function concatText(node, text) {
  node.value = (node.value || '') + text;
  return node;
}

exports.child = child;
exports.value = value;
exports.attr = attr;
exports.addChild = addChild;
exports.addText = addText;
exports.concatText = concatText;
