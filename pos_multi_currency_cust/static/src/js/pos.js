openerp.pos_multi_currency_cust = function (instance) {
    var _t = instance.web._t;
    var QWeb = instance.web.qweb;
    var round_di = instance.web.round_decimals;
    
    instance.point_of_sale.PosModel.prototype.models.push({
    	model: 'res.currency',
        fields: ['symbol','position','rounding','accuracy','rate_silent'],
//        ids:    function(self){ return [self.pricelist.currency_id[0]]; },
        loaded: function(self, currencies){
            var elementPos = currencies.map(function(x) {return x.id; }).indexOf(self.pricelist.currency_id[0]);
            self.currency = currencies[elementPos];

            if (self.currency.rounding > 0) {
                self.currency.decimals = Math.ceil(Math.log(1.0 / self.currency.rounding) / Math.log(10));
            } else {
                self.currency.decimals = 0;
            }
            self.db.add_currencies(currencies);

        },
    });
    
    var _super_posdb = instance.point_of_sale.PosDB.prototype;
    instance.point_of_sale.PosDB = instance.point_of_sale.PosDB.extend({
    	init: function(options){
    		this.currency_rate = {};
    		_super_posdb.init.call(this,options);
        },
        add_currencies: function(currencies){
            for(var i = 0, len = currencies.length; i < len; i++){
                var currency = currencies[i];
                if(currency.rate_silent){
                    this.currency_rate[currency.id] = round_di(currency.rate_silent,2);
                }
            }
        },
        get_currency_rate: function(currency_id){
            return this.currency_rate[currency_id];
        },
    });
    
    var PaymentlineParent = instance.point_of_sale.Paymentline.prototype;
    instance.point_of_sale.Paymentline = instance.point_of_sale.Paymentline.extend({

        initialize: function (attr, options) {
            PaymentlineParent.initialize.apply(this, arguments);
            console.log("inside Paymentline123");
        },
        
        get_amount_multi_currency: function(){
            console.log("currency: " +  this.get_type());
            if (this.get_type() === 'cash') {
                journal_currency = this.cashregister.journal.currency;
                
                // If no currency configured, return amount
                if (!journal_currency) {
                    return this.amount;
                }
                
                journal_currency_rate = this.pos.db.get_currency_rate(journal_currency[0]);
                company_currency = this.pos.company.currency_id;
                company_currency_rate = this.pos.db.get_currency_rate(company_currency[0]);
                
                if (journal_currency && journal_currency !== company_currency) {
                    factor = (company_currency_rate / journal_currency_rate);
                    console.log("Currency Conversion Factor: " + factor);
                    return this.amount * factor;
                    
                }
            }
            return this.amount;
        },
        
        get_journal_currency: function(){
            console.log("this.cashregister.journal.currency: " + this.cashregister.journal.currency);
            return this.cashregister.journal.currency ? this.cashregister.journal.currency[0] : false;
        },
        
    });
    
//    module.Order = module.Order.extend({
    instance.point_of_sale.Order = instance.point_of_sale.Order.extend({
        getPaidTotal: function() {
            return (this.get('paymentLines')).reduce((function(sum, paymentLine) {
                return sum + paymentLine.get_amount_multi_currency();
            }), 0);
        },
    });
    
//    module.PosBaseWidget.include({
    instance.point_of_sale.PosBaseWidget = instance.point_of_sale.PosBaseWidget.extend({
//    instance.point_of_sale.PosBaseWidget = instance.point_of_sale.PosBaseWidget.extend({
        format_multi_currency: function(amount,new_currency){
            console.log("new_currency: " + new_currency);
            if (new_currency) {
                var currency = new_currency;
            }
            else {
                var currency = (this.pos && this.pos.currency) ? this.pos.currency : {symbol:'$', position: 'after', rounding: 0.01, decimals: 2};
            }
            var decimals = currency.decimals;

//            if (precision && (typeof this.pos.dp[precision]) !== undefined) {
//                decimals = this.pos.dp[precision];
//            }

            if (typeof amount === 'number') {
                amount = round_di(amount,decimals).toFixed(decimals);
            }

            if (currency.position === 'after') {
                return amount + ' ' + (currency.symbol || '');
            } else {
                return (currency.symbol || '') + ' ' + amount;
            }
        },
    });
};