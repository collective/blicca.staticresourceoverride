from plone.base.interfaces import INonInstallable
from plone.registry.interfaces import IRegistry
from zope.component import getUtility
from zope.interface import implementer


# Keys this add-on adds to the shared dict record plone.patternoptions:
# "markspeciallinks" via the default profile (step 1), "contentbrowser" via
# the scoping exercise of step 4 (commented example in patternoptions.xml).
PATTERN_OPTION_KEYS = ("markspeciallinks", "contentbrowser")


@implementer(INonInstallable)
class HiddenProfiles:
    def getNonInstallableProfiles(self):
        """Hide the uninstall profile from the add-ons control panel."""
        return ["blicca.staticresourceoverride:uninstall"]

    def getNonInstallableProducts(self):
        return []


def post_uninstall(context):
    """Remove our entries from the shared dict record plone.patternoptions —
    individual dict keys (unlike whole records) cannot be removed
    declaratively via registry.xml.
    """
    registry = getUtility(IRegistry)
    options = dict(registry.get("plone.patternoptions") or {})
    remaining = {k: v for k, v in options.items() if k not in PATTERN_OPTION_KEYS}
    if remaining != options:
        registry["plone.patternoptions"] = remaining
