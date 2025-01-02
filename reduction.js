/*
Fōrmulæ relation package. Module for reduction.
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

Relation.relationReducer = async (expr, session) => {
	let left = expr.children[0], right = expr.children[1];
	let tag = expr.getTag();
	
	let compare = Formulae.createExpression("Relation.Compare");
	compare.addChild(left);
	compare.addChild(right);
	
	expr.replaceBy(compare);
	//session.log("converting to a COMPARE expression");
	let result = await session.reduceAndGet(compare, compare.index);
	
	ok: {
		if (result === compare) break ok;
		
		let resultTag = result.getTag();
		let b = false;
		
		switch (tag) {
			case "Relation.Equals":
				b = resultTag === "Relation.Comparison.Equals";
				break;
			
			case "Relation.Different":
				b =
					resultTag === "Relation.Comparison.Greater" ||
					resultTag === "Relation.Comparison.Less"    ||
					resultTag === "Relation.Comparison.Different"
				;
				break;
			
			case "Relation.Greater":
				if (resultTag === "Relation.Comparison.Different") {
					break ok;
				}
				b = resultTag === "Relation.Comparison.Greater";
				break;
			
			case "Relation.GreaterOrEquals":
				if (resultTag === "Relation.Comparison.Different") {
					break ok;
				}
				b =
					resultTag === "Relation.Comparison.Greater" ||
					resultTag === "Relation.Comparison.Equals"
				;
				break;
			
			case "Relation.Less":
				if (resultTag === "Relation.Comparison.Different") {
					break ok;
				}
				b = resultTag === "Relation.Comparison.Less";
				break;
				
			case "Relation.LessOrEquals":
				if (resultTag === "Relation.Comparison.Different") {
					break ok;
				}
				b =
					resultTag === "Relation.Comparison.Less" ||
					resultTag === "Relation.Comparison.Equals"
				;
				break;
		}
		
		result.replaceBy(Formulae.createExpression(b ? "Logic.True" : "Logic.False"));
		//session.log("Relational operand applied");
		return true;
	}
	
	// error
	result.replaceBy(expr);
	expr.setChild(0, left);
	expr.setChild(1, right);
	expr.setReduced();
	//session.log("Restoring original expression");
	return false; // Ok, forward for symbolic purposes (equations and inequalities)
};

Relation.mxxReducer = async (minmax, session) => {
	let expr = minmax.children[0];
	let n = expr.children.length;
	
	if (n == 0) {
		return false; // Ok, for symbolic purposes
	}
	else if (n == 1) {
		minmax.replaceBy(expr.children[0]);
		//session.log("min/max operation");
		return true;
	}
	
	let first, second;
	let min = minmax.getTag() === "Relation.Min";
	
	do {
		first = expr.children[0];
		second = expr.children[1];
		
		let compare = Formulae.createExpression("Relation.Compare");
		compare.addChild(first);
		compare.addChild(second);
		
		minmax.replaceBy(compare);
		//session.log("converting to a COMPARE expression");
		compare = await session.reduceAndGet(compare, compare.index);
		
		compare.replaceBy(minmax);
		expr.setChild(0, first);
		expr.setChild(1, second);
		//session.log("Restoring original expression");
		
		switch (compare.getTag()) {
			case "Relation.Comparison.Equals":
				expr.removeChildAt(0);
				break;
			
			case "Relation.Comparison.Less":
				expr.removeChildAt(min ? 1 : 0);
				break;
			
			case "Relation.Comparison.Greater":
				expr.removeChildAt(min ? 0 : 1);
				break;
			
			default: // anything else, including SAME, OTHER and no-reduction
				return false; // Ok, for symbolic purposes
		}
	} while (expr.children.length > 1);
	
	minmax.replaceBy(expr.children[0]);
	//session.log("min/max operation");
	return true;
};

Relation.membership = async (inNotIn, session) => {
	let value = inNotIn.children[0];
	
	// does not a symbol reduce ¿?
	//if (value.getTag().equals(RelationDescriptor.TAG_SYMBOL)) return false;
	
	// A list containing a symbol does not reduce ¿?
	//if (value.getTag().equals(RelationDescriptor.TAG_LIST))  {
	//	for (int i = 0, n = value.getChildCount(); i < n; ++i) {
	//		if (value.getChild(i).getTag().equals(RelationDescriptor.TAG_SYMBOL)) return false;
	//	}
	//}
	
	// the second argument must be a list
	let list = inNotIn.children[1];
	if (!list.getTag() === "List.List") {
		ReductionManager.setInError(list, "Expression must be a list");
		throw new ReductionError();
	}
	
	// type of membership
	
	let isIn = inNotIn.getTag() === "Relation.In";
	
	// comparison
	
	let compare;
	let tag;
	
	for (let i = 0, n = list.children.length; i < n; ++i) {
		compare = Formulae.createExpression("Relation.Compare");
		compare.addChild(value.clone());
		compare.addChild(list.children[i]);
		list.setChild(i, compare);
		
		compare = await session.reduceAndGet(compare, compare.index);
		
		tag = compare.getTag();
		if (tag === "Relation.Comparison.Equals") {
			if (isIn) {
				inNotIn.replaceBy(Formulae.createExpression("Logic.True"));
				return true;
			}
		}
	}
	
	inNotIn.replaceBy(Formulae.createExpression(isIn ? "Logic.False" : "Logic.True"));
	return true;
};

Relation.defaultCompareReducer = (compare, session) => {
	let leftExpression = compare.children[0], rightExpression = compare.children[1];
	
	let tagLeft = leftExpression.getTag();
	let tagRight = rightExpression.getTag();
	
	if (tagLeft === tagRight) {
		compare.replaceBy(Formulae.createExpression("Relation.Comparison.Equals"));
		return true;
	}
	
	let iLeft = tagLeft.lastIndexOf('.');
	
	if (
		iLeft > 0 &&
		iLeft == tagRight.lastIndexOf('.') &&
		tagLeft.substring(0, iLeft) === tagRight.substring(0, iLeft)
	) {
		compare.replaceBy(Formulae.createExpression("Relation.Comparison.Different"));
		return true;
	}
	
	return false;
};

Relation.setReducers = () => {
	ReductionManager.addReducer("Relation.Equals",          Relation.relationReducer, "Relation.relationReducer");
	ReductionManager.addReducer("Relation.Different",       Relation.relationReducer, "Relation.relationReducer");
	ReductionManager.addReducer("Relation.Greater",         Relation.relationReducer, "Relation.relationReducer");
	ReductionManager.addReducer("Relation.GreaterOrEquals", Relation.relationReducer, "Relation.relationReducer");
	ReductionManager.addReducer("Relation.Less",            Relation.relationReducer, "Relation.relationReducer");
	ReductionManager.addReducer("Relation.LessOrEquals",    Relation.relationReducer, "Relation.relationReducer");
	
	ReductionManager.addReducer("Relation.Min", Relation.mxxReducer, "Relation.mxxReducer");
	ReductionManager.addReducer("Relation.Max", Relation.mxxReducer, "Relation.mxxReducer");
	
	ReductionManager.addReducer("Relation.In",    Relation.membership, "Relation.membership");
	ReductionManager.addReducer("Relation.NotIn", Relation.membership, "Relation.membership");
	
	ReductionManager.addReducer("Relation.Compare", Relation.defaultCompareReducer, "Relation.defaultCompareReducer", { precedence: ReductionManager.PRECEDENCE_LOW });
};
