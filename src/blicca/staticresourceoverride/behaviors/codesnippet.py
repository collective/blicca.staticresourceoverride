from plone.app.z3cform.widgets.text import TextAreaFieldWidget
from plone.autoform import directives
from plone.autoform.interfaces import IFormFieldProvider
from plone.supermodel import model
from zope import schema
from zope.interface import provider


@provider(IFormFieldProvider)
class ICodeSnippet(model.Schema):
    """Adds a code snippet field that is edited with the code-editor pattern.

    Stretch goal: pattern options don't only live site-wide in the
    plone.patternoptions record. A widget can set its own pattern and
    options — the widget then renders the trigger class (pat-code-editor)
    and a data-pat-code-editor attribute on the <textarea>. Options set here
    take precedence over the site-wide defaults from the <body>.

    The behavior has no factory, so the schema doubles as its marker
    interface: Dexterity applies it dynamically to every object of a type
    that lists the behavior. The viewlet in browser/configure.zcml is
    registered for it, so it only shows up where the field exists.
    """

    model.fieldset(
        "code_snippet",
        label="Code snippet",
        fields=["code_snippet"],
    )

    # The autoform widget directive: use the plain textarea widget of
    # plone.app.z3cform, but switch on the code-editor pattern. Every keyword
    # argument is set as an attribute on the widget instance — "pattern" and
    # "pattern_options" are the ones that plone.app.z3cform's pattern-aware
    # widgets evaluate when rendering the element.
    directives.widget(
        "code_snippet",
        TextAreaFieldWidget,
        pattern="code-editor",
        pattern_options={"language": "python", "linenumbers": True},
    )
    code_snippet = schema.Text(
        title="Code snippet",
        description=(
            "Edited with pat-code-editor: syntax highlighting, indentation and "
            "line numbers — configured by the widget, not by JavaScript."
        ),
        required=False,
    )
