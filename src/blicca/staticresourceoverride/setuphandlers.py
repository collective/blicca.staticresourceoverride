from plone.base.interfaces import INonInstallable
from plone.registry.interfaces import IRegistry
from zope.component import getUtility
from zope.interface import implementer


@implementer(INonInstallable)
class HiddenProfiles:
    def getNonInstallableProfiles(self):
        """Hide the uninstall profile from the add-ons control panel."""
        return ["blicca.staticresourceoverride:uninstall"]

    def getNonInstallableProducts(self):
        return []


def post_uninstall(context):
    """Remove our entry from the shared dict record plone.patternoptions —
    individual dict keys (unlike whole records) cannot be removed
    declaratively via registry.xml.
    """
    registry = getUtility(IRegistry)
    options = dict(registry.get("plone.patternoptions") or {})
    if "contentbrowser" in options:
        del options["contentbrowser"]
        registry["plone.patternoptions"] = options
