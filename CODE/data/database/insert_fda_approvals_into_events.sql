INSERT INTO events(event_type, concept_name, concept_code, concept_id, date)
select 'FDA_APPROVAL',
		concept_name,
	concept_code,
	concept_id,
	min(to_timestamp(
		case when f.approval_date = 'Approved Prior to Jan 1, 1982' then 'Jan 01, 1982' else f.approval_date end, 'Mon DD, YYYY'))
from
	fda_approvals f
INNER JOIN concept c on lower(c.concept_name) = lower(f.ingredient)
where c.vocabulary_id = 'RxNorm'
and c.concept_class_id = 'Ingredient'
group by 	concept_name,
	concept_code,
	concept_id;

INSERT INTO events(event_type, concept_name, concept_code, concept_id, date)
select 'FDA_APPROVAL',
		concept_name,
	concept_code,
	concept_id,
	min(to_timestamp(
		case when f.approval_date = 'Approved Prior to Jan 1, 1982' then 'Jan 01, 1982' else f.approval_date end, 'Mon DD, YYYY'))
from
	fda_approvals f
INNER JOIN concept c on lower(c.concept_name) = lower(f.trade_name)
where c.vocabulary_id = 'RxNorm'
and c.concept_class_id = 'Brand Name'
group by 	concept_name,
	concept_code,
	concept_id;

	INSERT INTO events(event_type, concept_name, concept_code, concept_id, date)
	select 'FDA_APPROVAL',
			concept_name,
		concept_code,
		concept_id,
		min(to_timestamp(
			case when f.approval_date = 'Approved Prior to Jan 1, 1982' then 'Jan 01, 1982' else f.approval_date end, 'Mon DD, YYYY'))
	from
		fda_approvals f
	INNER JOIN concept c on lower(c.concept_name) = lower(split_part(f.ingredient, ' ', 1))
	where c.vocabulary_id = 'RxNorm'
	and c.concept_class_id = 'Ingredient'
	  and (concept_name) not in
	      (select concept_name from events where event_type = 'FDA_APPROVAL')
	group by 	concept_name,
		concept_code,
		concept_id;
