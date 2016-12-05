from openerp.osv import fields, osv

class res_currency(osv.osv):
    _inherit = "res.currency"
    
    def _current_rate_silent_new(self, cr, uid, ids, name, arg, context=None):
        return self._get_current_rate(cr, uid, ids, raise_on_no_rate=False, context=context)
    
    _columns = {
        'rate_silent': fields.function(_current_rate_silent_new, string='Current Rate', digits=(12,6), store=True,
            help='The rate of the currency to the currency of rate 1 (0 if no rate defined).'),
    }