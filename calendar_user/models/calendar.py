# -*- coding: utf-8 -*-
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

from odoo import models, fields, api, _


class CalendarEvent(models.Model):
    _inherit = "calendar.event"

    user_name = fields.Char('User Name', related='user_id.name', readonly=True, store=True)

