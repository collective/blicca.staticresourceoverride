---
myst:
    html_meta:
        "description": "Stretch goal: a behavior whose text field is edited with pat-code-editor via an autoform widget directive, shown in the view with pat-syntax-highlight from the add-on bundle."
        "property=og:description": "Stretch goal: a behavior whose text field is edited with pat-code-editor via an autoform widget directive, shown in the view with pat-syntax-highlight from the add-on bundle."
        "property=og:title": "Stretch goal: a code snippet behavior"
        "keywords": "Plone, Blicca, behavior, autoform, widget, pattern options, code-editor, syntax-highlight, viewlet"
---

(blicca-stretch-code-snippet-label)=

# Stretch goal: a code snippet behavior

This chapter is for fast participants.
It closes two circles at once: pattern options from {ref}`blicca-pattern-options-label`, this time per form widget instead of site-wide, and the add-on bundle from {ref}`blicca-own-pattern-label`, this time shipping a pattern that Patternslib already has.

The goal: a behavior adds a text field to pages.
In the edit form, the field is a code editor with syntax highlighting and line numbers.
In the view, the snippet is shown highlighted below the content.
No pattern is written, and no widget is written.

## Pattern options per widget

Site-wide options travel down from the `<body>`.
But a pattern can also be switched on for a single form field, with its own options.

The form widgets in `plone.app.z3cform` are pattern-aware.
Every widget has a `pattern` and a `pattern_options` attribute.
When `pattern` is set, the widget renders the trigger class `pat-<name>` and a `data-pat-<name>` attribute with the options as JSON on its form element.
Plone's own widgets, such as the related items or the date widgets, work exactly like this.

We use this for a small behavior in {file}`behaviors/codesnippet.py`:

```python
from plone.app.z3cform.widgets.text import TextAreaFieldWidget
from plone.autoform import directives
from plone.autoform.interfaces import IFormFieldProvider
from plone.supermodel import model
from zope import schema
from zope.interface import provider


@provider(IFormFieldProvider)
class ICodeSnippet(model.Schema):
    model.fieldset(
        "code_snippet",
        label="Code snippet",
        fields=["code_snippet"],
    )

    directives.widget(
        "code_snippet",
        TextAreaFieldWidget,
        pattern="code-editor",
        pattern_options={"language": "python", "linenumbers": True},
    )
    code_snippet = schema.Text(
        title="Code snippet",
        required=False,
    )
```

Three things matter here:

- `TextAreaFieldWidget` is Plone's plain textarea widget.
  We don't write a widget, we configure one.
- The autoform `directives.widget()` sets every keyword argument as an attribute on the widget instance.
  `pattern` and `pattern_options` are the two attributes that the pattern-aware widgets evaluate.
- `pattern_options` is a Python dictionary.
  The widget serializes it to JSON, and the Patternslib parser reads JSON attributes.

`pat-code-editor` is a Patternslib pattern that ships with the Plone bundle.
Plone uses it for the Dexterity model editor and for the custom CSS field of the theming control panel.
It turns a `<textarea>` into a CodeJar editor with `highlight.js` syntax highlighting, and writes every change back into the textarea, so the form submits the value as usual.
The option names come from its parser: `language`, `linenumbers`, `theme`, and a few CodeJar options such as `tab`.

The behavior is registered in {file}`behaviors/configure.zcml`:

```xml
<include package="plone.behavior" file="meta.zcml" />

<plone:behavior
    name="blicca.staticresourceoverride.codesnippet"
    title="Code snippet (Blicca training)"
    description="Adds a code snippet field that is edited with the code-editor pattern."
    provides=".codesnippet.ICodeSnippet"
    marker=".codesnippet.ICodeSnippet"
    />
```

There is no `factory`, so the field value is stored as a plain attribute on the content object.
And without a factory, the behavior can't have a separate marker interface, `plone.behavior` refuses that at startup.
The schema itself is the marker.
With `marker` set, Dexterity applies it to every object of a type that lists the behavior, and we need that for the viewlet below.

## Enable it on a type

Open {menuselection}`Site Setup --> Content --> Content Types --> Page --> Behaviors`, enable {guilabel}`Code snippet (Blicca training)`, and save.
Edit any page.
The new fieldset {guilabel}`Code snippet` shows a code editor with Python highlighting and line numbers, instead of a plain textarea.

Inspect the hidden `<textarea>` in the developer tools:

```html
<textarea
    name="form.widgets.ICodeSnippet.code_snippet"
    class="textarea-widget pat-code-editor form-control"
    data-pat-code-editor='{"language": "python", "linenumbers": true}'
></textarea>
```

Now change the options in {file}`behaviors/codesnippet.py`.
Switch `language` to `css`, or turn the line numbers off, and restart the instance.
No build, no bundle.

As with the registry record in {ref}`blicca-pattern-options-label`, we persist the through-the-web change in the profile, in {file}`profiles/default/types/Document.xml`:

```xml
<?xml version="1.0" encoding="utf-8"?>
<object name="Document" meta_type="Dexterity FTI">
  <property name="behaviors" purge="false">
    <element value="blicca.staticresourceoverride.codesnippet" />
  </property>
</object>
```

`purge="false"` keeps the behaviors that are already enabled on the type.
The uninstall profile takes the behavior away again with `remove="true"` on the element in {file}`profiles/uninstall/types/Document.xml`.

## The two levels combine

The widget sets `language` and `linenumbers`.
The theme is a site-wide decision, so it belongs into `plone.patternoptions`, next to the `markspeciallinks` entry:

```xml
<element key="code-editor">{"theme": "light"}</element>
```

The `<body>` now carries `data-pat-code-editor='{"theme": "light"}'`, and the textarea carries the language and the line numbers.
The parser walks up the DOM tree and merges both.
Attributes on the element win over inherited ones, so a widget can always override the site-wide default.

Look at the Dexterity model editor in {menuselection}`Site Setup --> Content --> Content Types --> Page --> Edit XML Field Model`.
It uses the same pattern, and it turned light as well.
A site-wide entry affects every instance of a pattern, whether you had it in mind or not.
Be deliberate, again.

Add the new key to `PATTERN_OPTION_KEYS` in {file}`setuphandlers.py`, so that the `post_uninstall` handler removes it, see {ref}`blicca-production-label`.

## Show the snippet in the view

A field that nobody sees is only half a feature.
A viewlet renders the snippet below the content body, in {file}`browser/viewlets.py`:

```python
from plone.app.layout.viewlets.common import ViewletBase


class CodeSnippetViewlet(ViewletBase):
    def update(self):
        super().update()
        self.code_snippet = (getattr(self.context, "code_snippet", None) or "").strip()

    def render(self):
        if not self.code_snippet:
            return ""
        return self.index()
```

The viewlet in {file}`browser/configure.zcml` is registered for the behavior schema, which is the marker, and only for the default view:

```xml
<browser:viewlet
    name="blicca.staticresourceoverride.codesnippet"
    for="..behaviors.codesnippet.ICodeSnippet"
    view="plone.app.layout.globals.interfaces.IViewView"
    manager="plone.app.layout.viewlets.interfaces.IBelowContentBody"
    class=".viewlets.CodeSnippetViewlet"
    template="code_snippet.pt"
    permission="zope2.View"
    />
```

The template {file}`browser/code_snippet.pt` renders a `<pre>` block with a pattern trigger:

```html
<section class="code-snippet mb-4" id="code-snippet">
    <h2 class="h5">Code snippet</h2>
    <pre
        class="pat-syntax-highlight"
        data-pat-syntax-highlight="theme: light"
    ><code class="language-python" tal:content="view/code_snippet"></code></pre>
</section>
```

`tal:content` escapes the value, and the pattern unescapes it again before highlighting.

Restart, open a page with a snippet, and the view shows a plain `<pre>` block.
Plain, because `pat-syntax-highlight` is a Patternslib pattern that the Plone bundle does not register.
Check it yourself in the browser console, which lists every registered pattern name:

```js
Object.keys(window.__patternslib_registry);
```

`code-editor` is there, `syntax-highlight` is not.
`pat-code-editor` is no alternative for the view: CodeJar makes its element editable.

## Ship the missing pattern

The registry is shared, so a pattern doesn't have to be your own to arrive through your bundle.
One import in {file}`resources/overrides.js` changes the picture:

```js
import "@patternslib/patternslib/src/pat/syntax-highlight/syntax-highlight";
```

Rebuild with `pnpm run build`, reload the page, and the block is highlighted, in the light theme from the `data-pat-syntax-highlight` attribute.
The pattern registers itself in the shared Patternslib registry on import, exactly like `pat-blicca`.
Webpack puts the pattern, `highlight.js`, and its language modules into lazily loaded chunks of your bundle, so a page without the trigger class pays nothing.

## Checkpoint

The code snippet field on pages is a code editor with line numbers and a light theme.
The saved snippet is shown highlighted below the page, and not in the edit form.
The console lists `syntax-highlight` as a registered pattern.

The worked solution is on the branch `stretch-code-snippet`.
