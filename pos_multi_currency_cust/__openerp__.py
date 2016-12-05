# -*- coding: utf-8 -*-
{
    'name': "POS Multi-Currency Customization",

    'summary': """
    """,

    'description': """
If journal currency is different then company's currency then it does currency calculation
    """,

    'author': "Aasim Ahmed Ansari",
    'website': "http://aasimania.wordpress.com",

    # Categories can be used to filter modules in modules listing
    # Check https://github.com/odoo/odoo/blob/master/openerp/addons/base/module/module_data.xml
    # for the full list
    'category': 'Uncategorized',
    'version': '0.1',

    # any module necessary for this one to work correctly
    'depends': ['base','point_of_sale'],

    # always loaded
    'data': [
        # 'security/ir.model.access.csv',
        'views/pos_view.xml',
    ],
#    'qweb': ['static/src/xml/pos_custom.xml'],
    'js': ['static/src/js/pos.js'],
    # only loaded in demonstration mode
    'demo': [
#        'demo.xml',
    ],
}