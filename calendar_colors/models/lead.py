##############################################################################
# For copyright and license notices, see __manifest__.py file in module root
# directory
##############################################################################
import logging
from datetime import datetime, timedelta, date
from dateutil.relativedelta import relativedelta

from odoo import api, fields, models, tools, SUPERUSER_ID
from odoo.tools.translate import _
from odoo.tools import email_re, email_split
from odoo.exceptions import UserError, AccessError



class Lead(models.Model):
    _inherit = "crm.lead"

    #I use the same name for the field location that is used in calendar.event.
    #This is To avoid using different variable names for the same field in different classes.
    #location_id should be used but that means a total recoding on calendar module.

    location = fields.Many2one('calendar.event.location', 'Location',  track_visibility='onchange', help="Location of Oportunity")
    calendar_id = fields.Many2one('calendar.calendar', 'Calendar', track_visibility='onchange', help="Calendar of Oportunity")


    @api.multi
    def action_schedule_meeting(self):
        """ Open meeting's calendar view to schedule meeting on current opportunity.
            :return dict: dictionary value for created Meeting view
        """
        action=super(Lead,self).action_schedule_meeting()
        context=action['context']
        context['default_location_id']= self.location.id
        context['default_calendar_id']= self.calendar_id.id
        action['context'] = context
        return action