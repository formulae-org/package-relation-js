/*
Fōrmulæ relation package. Module for expression definition & visualization.
Copyright (C) 2015-2023 Laurence R. Ugalde

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

'use strict';

export class Relation extends Formulae.Package {}

Relation.setExpressions = function(module) {
	[ "Equals", "Different", "Greater", "GreaterOrEquals", "Less", "LessOrEquals", "Compare", "In", "NotIn" ].forEach(tag => Formulae.setExpression(module, "Relation." + tag, {
		clazz:       Expression.Infix,
		getTag:      () => "Relation." + tag,
		getOperator: () => Relation.messages["operator" + tag],
		getName:     () => Relation.messages["name" + tag],
		min: 2, max: 2
	}));
	
	[ "Equals", "Less", "Greater", "Different" ].forEach(tag => Formulae.setExpression(module, "Relation.Comparison." + tag, {
		//clazz:      Expression.Literal,
		clazz:      Expression.LabelExpression,
		getTag:     () => "Relation.Comparison." + tag,
		//getLiteral: () => Relation.messages["literalComparison" + tag],
		getLabel:   () => Relation.messages["literalComparison" + tag],
		getName:    () => Relation.messages["nameComparison" + tag]
	}));
	
	[ "Min", "Max" ].forEach(tag => Formulae.setExpression(module, "Relation." + tag, {
		clazz:      Expression.PrefixedLiteral,
		getTag:     () => "Relation." + tag,
		getLiteral: () => Relation.messages["literal" + tag],
		getName:    () => Relation.messages["name" + tag]
	}));
};
