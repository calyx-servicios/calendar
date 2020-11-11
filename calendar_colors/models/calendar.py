##############################################################################
# For copyright and license notices, see __manifest__.py file in module root
# directory
##############################################################################
from odoo import models, fields, api, _
from odoo.exceptions import ValidationError
from dateutil.relativedelta import relativedelta
import requests
import sys
from lxml import html
from odoo.exceptions import AccessError, UserError, RedirectWarning, ValidationError, Warning

import re
import logging
_logger = logging.getLogger(__name__)


class Location(models.Model):
	_name = 'calendar.event.location'
	name = fields.Char('Location', required=True)
    
    
class Calendar(models.Model):
	_name = 'calendar.calendar'
	name = fields.Char('Calendar', required=True)
	color = fields.Integer('Color')
    

class Meeting(models.Model):
	_inherit = 'calendar.event'
	location = fields.Many2one('calendar.event.location', 'Location', states={'done': [('readonly', True)]}, track_visibility='onchange', help="Location of Event")
	calendar_id = fields.Many2one('calendar.calendar', 'Calendar', states={'done': [('readonly', True)]}, track_visibility='onchange', help="Calendar of Event")
	calendar_color = fields.Integer('Calendar',related='calendar_id.color')