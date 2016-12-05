from openerp.osv import fields, osv
import openerp.addons.decimal_precision as dp

class pos_order(osv.osv):
    _inherit = "pos.order"
    
    def _amount_all_new(self, cr, uid, ids, name, args, context=None):
        cur_obj = self.pool.get('res.currency')
        res = {}
        for order in self.browse(cr, uid, ids, context=context):
            res[order.id] = {
                'amount_paid': 0.0,
                'amount_return':0.0,
                'amount_tax':0.0,
            }
            val1 = val2 = 0.0
            cur = order.pricelist_id.currency_id
            for payment in order.statement_ids:
                payment_amount = payment.amount
                if payment.journal_id.currency:
                    payment_amount = cur_obj._compute(cr,uid,payment.journal_id.currency,order.company_id.currency_id,payment.amount)
                    print "payment_amount: ",payment_amount

                res[order.id]['amount_paid'] +=  payment_amount
                res[order.id]['amount_return'] += (payment_amount < 0 and payment_amount or 0)

            for line in order.lines:
                val1 += line.price_subtotal_incl
                val2 += line.price_subtotal
            res[order.id]['amount_tax'] = cur_obj.round(cr, uid, cur, val1-val2)
            res[order.id]['amount_total'] = cur_obj.round(cr, uid, cur, val1)
        print "res: ",res
        return res
    
    _columns = {
        'amount_tax': fields.function(_amount_all_new, string='Taxes', digits_compute=dp.get_precision('Account'), multi='all'),
        'amount_total': fields.function(_amount_all_new, string='Total', digits_compute=dp.get_precision('Account'),  multi='all'),
        'amount_paid': fields.function(_amount_all_new, string='Paid', states={'draft': [('readonly', False)]}, readonly=True, digits_compute=dp.get_precision('Account'), multi='all'),
        'amount_return': fields.function(_amount_all_new, 'Returned', digits_compute=dp.get_precision('Account'), multi='all'),
    }