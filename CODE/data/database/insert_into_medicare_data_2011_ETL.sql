INSERT INTO medicare_data (
	year,
	npi,
	provider_last_name,
	provider_first_name,
	city,
	state,
	specialty,
	description,
	drug_brand_name,
	drug_name,
	beneficiary_count,
	total_claim_count,
	total_30_day_fill_count,
	total_day_supply,
	total_drug_cost,
	bene_count_ge65,
	bene_count_ge65_suppress_flag,
	total_claim_count_ge65,
	ge65_suppress_flag,
	total_30_day_fill_count_ge65,
	total_day_supply_ge65,
	total_drug_cost_ge65)

select
	2011,
	mcpp.npi,
	npi.last_name,
	npi.first_name,
	npi.city,
	npi.state,
	npi.specialty,
	npi.description,
	'',
	mc.drug_name,
	mc.benefits_count,
	mc.claim_count,
	0,
	mc.days_supply_sum,
	mc.gross_drug_cost_sum,
	0,
	0,
	0,
	0,
	0,
	0,
	0

from medicare_2011 mc
inner join medicare_provider_2011 mcpp
    on mc.presciber_id = mcpp.unique_prescriber_id
left outer join npi_lookup npi
    on npi.npi = mcpp.npi