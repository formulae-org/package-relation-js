/*
Fōrmulæ relation package. Module for edition.
Copyright (C) 2015-2025 Laurence R. Ugalde

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

Relation.setEditions = function() {
	Formulae.addEdition(this.messages.pathRelation, null, this.messages.leafEquals,          () => Expression.binaryEdition("Relation.Equals",          false));
	Formulae.addEdition(this.messages.pathRelation, null, this.messages.leafDifferent,       () => Expression.binaryEdition("Relation.Different",       false));
	Formulae.addEdition(this.messages.pathRelation, null, this.messages.leafGreater,         () => Expression.binaryEdition("Relation.Greater",         false));
	Formulae.addEdition(this.messages.pathRelation, null, this.messages.leafGreaterOrEquals, () => Expression.binaryEdition("Relation.GreaterOrEquals", false));
	Formulae.addEdition(this.messages.pathRelation, null, this.messages.leafLess,            () => Expression.binaryEdition("Relation.Less",            false));
	Formulae.addEdition(this.messages.pathRelation, null, this.messages.leafLessOrEquals,    () => Expression.binaryEdition("Relation.LessOrEquals",    false));
	
	Formulae.addEdition(this.messages.pathComparison, null, this.messages.leafCompare, () => Expression.binaryEdition("Relation.Compare", false));
	
	Formulae.addEdition(this.messages.pathComparison, null, this.messages.leafComparisonEquals,    () => Expression.replacingEdition("Relation.Comparison.Equals"   ));
	Formulae.addEdition(this.messages.pathComparison, null, this.messages.leafComparisonLess,      () => Expression.replacingEdition("Relation.Comparison.Less"     ));
	Formulae.addEdition(this.messages.pathComparison, null, this.messages.leafComparisonGreater,   () => Expression.replacingEdition("Relation.Comparison.Greater"  ));
	Formulae.addEdition(this.messages.pathComparison, null, this.messages.leafComparisonDifferent, () => Expression.replacingEdition("Relation.Comparison.Different"));
	
	Formulae.addEdition(this.messages.pathRelation, null, this.messages.leafMin, () => Expression.wrapperEdition("Relation.Min"));
	Formulae.addEdition(this.messages.pathRelation, null, this.messages.leafMax, () => Expression.wrapperEdition("Relation.Max"));
	
	Formulae.addEdition(this.messages.pathRelation, null, this.messages.leafIn,    () => Expression.binaryEdition("Relation.In",    false));
	Formulae.addEdition(this.messages.pathRelation, null, this.messages.leafNotIn, () => Expression.binaryEdition("Relation.NotIn", false));
};
