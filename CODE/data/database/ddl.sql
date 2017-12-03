create sequence events_seq
;

create table drugs_by_count
(
	count integer,
	concept_id integer not null
		constraint drugs_by_count_pkey
			primary key,
	concept_name text,
	domain_id text,
	vocabulary_id text,
	concept_class_id text,
	standard_concept text,
	concept_code integer,
	valid_start_date text,
	valid_end_date text,
	invalid_reason text
)
;

create table concept
(
	concept_id integer not null
		constraint xpk_concept
			primary key,
	concept_name varchar(255) not null,
	domain_id varchar(20) not null,
	vocabulary_id varchar(20) not null,
	concept_class_id varchar(20) not null,
	standard_concept char,
	concept_code varchar(50) not null,
	valid_start_date date not null,
	valid_end_date date not null,
	invalid_reason char
)
;

create unique index idx_concept_concept_id
	on concept (concept_id)
;

create index idx_concept_domain_id
	on concept (domain_id)
;

create index idx_concept_vocabluary_id
	on concept (vocabulary_id)
;

create index idx_concept_class_id
	on concept (concept_class_id)
;

create index idx_concept_code
	on concept (concept_code)
;

create table vocabulary
(
	vocabulary_id varchar(20) not null
		constraint xpk_vocabulary
			primary key,
	vocabulary_name varchar(255) not null,
	vocabulary_reference varchar(255),
	vocabulary_version varchar(255),
	vocabulary_concept_id integer not null
)
;

create unique index idx_vocabulary_vocabulary_id
	on vocabulary (vocabulary_id)
;

create table domain
(
	domain_id varchar(20) not null
		constraint xpk_domain
			primary key,
	domain_name varchar(255) not null,
	domain_concept_id integer not null
)
;

create unique index idx_domain_domain_id
	on domain (domain_id)
;

create table concept_class
(
	concept_class_id varchar(20) not null
		constraint xpk_concept_class
			primary key,
	concept_class_name varchar(255) not null,
	concept_class_concept_id integer not null
)
;

create unique index idx_concept_class_class_id
	on concept_class (concept_class_id)
;

create table concept_relationship
(
	concept_id_1 integer not null,
	concept_id_2 integer not null,
	relationship_id varchar(20) not null,
	valid_start_date date not null,
	valid_end_date date not null,
	invalid_reason char,
	constraint xpk_concept_relationship
		primary key (concept_id_1, concept_id_2, relationship_id)
)
;

create index idx_concept_relationship_id_1
	on concept_relationship (concept_id_1)
;

create index idx_concept_relationship_id_2
	on concept_relationship (concept_id_2)
;

create index idx_concept_relationship_id_3
	on concept_relationship (relationship_id)
;

create table relationship
(
	relationship_id varchar(20) not null
		constraint xpk_relationship
			primary key,
	relationship_name varchar(255) not null,
	is_hierarchical char not null,
	defines_ancestry char not null,
	reverse_relationship_id varchar(20) not null,
	relationship_concept_id integer not null
)
;

create unique index idx_relationship_rel_id
	on relationship (relationship_id)
;

create table concept_synonym
(
	concept_id integer not null,
	concept_synonym_name varchar(1000) not null,
	language_concept_id integer not null
)
;

create index idx_concept_synonym_id
	on concept_synonym (concept_id)
;

create table concept_ancestor
(
	ancestor_concept_id integer not null,
	descendant_concept_id integer not null,
	min_levels_of_separation integer not null,
	max_levels_of_separation integer not null,
	constraint xpk_concept_ancestor
		primary key (ancestor_concept_id, descendant_concept_id)
)
;

create index idx_concept_ancestor_id_1
	on concept_ancestor (ancestor_concept_id)
;

create index idx_concept_ancestor_id_2
	on concept_ancestor (descendant_concept_id)
;

create table source_to_concept_map
(
	source_code varchar(50) not null,
	source_concept_id integer not null,
	source_vocabulary_id varchar(20) not null,
	source_code_description varchar(255),
	target_concept_id integer not null,
	target_vocabulary_id varchar(20) not null,
	valid_start_date date not null,
	valid_end_date date not null,
	invalid_reason char,
	constraint xpk_source_to_concept_map
		primary key (source_vocabulary_id, target_concept_id, source_code, valid_end_date)
)
;

create index idx_source_to_concept_map_code
	on source_to_concept_map (source_code)
;

create index idx_source_to_concept_map_id_1
	on source_to_concept_map (source_vocabulary_id)
;

create index idx_source_to_concept_map_id_3
	on source_to_concept_map (target_concept_id)
;

create index idx_source_to_concept_map_id_2
	on source_to_concept_map (target_vocabulary_id)
;

create table drug_strength
(
	drug_concept_id integer not null,
	ingredient_concept_id integer not null,
	amount_value numeric,
	amount_unit_concept_id integer,
	numerator_value numeric,
	numerator_unit_concept_id integer,
	denominator_value numeric,
	denominator_unit_concept_id integer,
	box_size integer,
	valid_start_date date not null,
	valid_end_date date not null,
	invalid_reason char,
	constraint xpk_drug_strength
		primary key (drug_concept_id, ingredient_concept_id)
)
;

create index idx_drug_strength_id_1
	on drug_strength (drug_concept_id)
;

create index idx_drug_strength_id_2
	on drug_strength (ingredient_concept_id)
;

create table medicaid_data
(
	pk_medicaid_data bigserial not null
		constraint table_name_pkey
			primary key,
	utilization_type varchar(4),
	state varchar(2) default 'XX'::character varying not null,
	labeler_code varchar(5),
	product_code varchar(4),
	package_size varchar(2),
	year integer default 0 not null,
	quarter integer,
	product_name varchar(10),
	supression_used varchar(1),
	units_reimbursed numeric,
	number_of_prescriptions integer,
	total_amount_reimbursed numeric,
	medicaid_amount_reimbursed numeric,
	non_medicaid_amount_reimbursed numeric,
	quarter_begin varchar(5),
	quarter_begin_data varchar(22),
	latitude varchar(50),
	longitude varchar(50),
	location varchar(255),
	ndc varchar(11),
	concept_id integer,
	concept_name varchar(255),
	concept_code varchar(50)
)
;

create index medicaid_data_state_index
	on medicaid_data (state)
;

create index medicaid_data_year_quarter_state_number_of_prescriptions_index
	on medicaid_data (year, quarter, state, number_of_prescriptions)
;

create index medicaid_data_year_number_of_prescriptions_index
	on medicaid_data (year, number_of_prescriptions)
;

create index medicaid_data_year_index
	on medicaid_data (year)
;

create index medicaid_data_quarter_index
	on medicaid_data (quarter)
;

create index medicaid_data_supression_used_index
	on medicaid_data (supression_used)
;

create index medicaid_data_number_of_prescriptions_index
	on medicaid_data (number_of_prescriptions)
;

create index medicaid_data_concept_name_year_index
	on medicaid_data (concept_name, year)
;

create index medicaid_data_concept_name_index
	on medicaid_data (concept_name)
;

create table ndc_lookup
(
	ndc_concept_id integer,
	ndc_concept_code varchar(11),
	ndc_concept_name varchar(255),
	rxnorm_concept_id integer,
	rxnorm_concept_code varchar(255),
	rxnorm_concept_name varchar(255)
)
;

create index ndc_lookup_ndc_concept_id_index
	on ndc_lookup (ndc_concept_id)
;

create index ndc_lookup_ndc_concept_code_index
	on ndc_lookup (ndc_concept_code)
;

create index ndc_lookup_rxnorm_concept_id_index
	on ndc_lookup (rxnorm_concept_id)
;

create table npi_lookup
(
	npi varchar(10) not null
		constraint npi_lookup_pkey
			primary key,
	first_name varchar(255),
	last_name varchar(255),
	city varchar(255),
	state varchar(255),
	specialty varchar(255),
	description varchar(255)
)
;

create table faers_demo
(
	primaryid bigint not null
		constraint faers_demo_pkey
			primary key,
	caseid integer,
	caseversion varchar(255),
	i_f_code varchar(1),
	event_dt varchar(12),
	mfr_dt varchar(12),
	init_fda_dt varchar(12),
	fda_dt integer,
	rept_cod varchar(255),
	auth_num varchar(255),
	mfr_num varchar(255),
	mfr_sndr varchar(255),
	lit_ref varchar(255),
	age varchar(255),
	age_grp varchar(255),
	sex varchar(255),
	e_sub varchar(255),
	wt varchar(255),
	wt_cod varchar(255),
	rept_dt varchar(12) default 0,
	to_mfr varchar(255),
	occp_cod varchar(255),
	reporter_country varchar(255),
	occr_country varchar(255),
	datestr char(6)
)
;

create unique index faers_demo_primaryid_uindex
	on faers_demo (primaryid)
;

create index faers_demo_caseid_index
	on faers_demo (caseid)
;

create index faers_demo_fda_dt_index
	on faers_demo (fda_dt)
;

create index faers_demo_datestr_index
	on faers_demo (datestr)
;

create table faers_drug
(
	primaryid integer not null,
	caseid integer,
	drug_seq varchar(255),
	role_cod varchar(255),
	drugname varchar(255),
	prod_ai varchar(255),
	val_vbm varchar(255),
	route varchar(255),
	dose_vbm varchar(255),
	cum_dose_chr varchar(255),
	cum_dose_unit varchar(255),
	dechal varchar(255),
	rechal varchar(255),
	lot_num varchar(255),
	exp_dt varchar(255),
	nda_num varchar(255),
	dose_amt varchar(255),
	dose_unit varchar(255),
	dose_form varchar(255),
	dose_freq varchar(255)
)
;

create index faers_drug_primaryid_index
	on faers_drug (primaryid)
;

create index faers_drug_drugname_index
	on faers_drug (drugname)
;

create index faers_drug_prod_ai_index
	on faers_drug (prod_ai)
;

create table faers_outcome
(
	primaryid integer not null,
	caseid integer,
	outc_cod varchar(255)
)
;

create index faers_outcome_primaryid_index
	on faers_outcome (primaryid)
;

create index faers_outcome_outc_cod_index
	on faers_outcome (outc_cod)
;

create table fda_approvals
(
	ingredient varchar(255) not null,
	df_route varchar(255),
	trade_name varchar(255),
	applicant varchar(255),
	strength varchar(255),
	application_type varchar(255),
	application_number varchar(255),
	product_number varchar(255),
	te_code varchar(255),
	approval_date varchar(255),
	rld varchar(255),
	rs varchar(255),
	type varchar(255),
	applicant_full_name varchar(255),
	approval_year integer
)
;

create index fda_approvals_ingredient_index
	on fda_approvals (ingredient)
;

create index fda_approvals_trade_name_index
	on fda_approvals (trade_name)
;

create table events
(
	event_id integer default nextval('events_seq'::regclass) not null
		constraint events_pkey
			primary key,
	event_type varchar(30),
	concept_name varchar(255),
	concept_code varchar(255),
	concept_id integer,
	text text,
	sentiment_pos double precision,
	sentiment_neg double precision,
	category varchar(255),
	overall_score double precision,
	reaction varchar(255),
	reaction_serious integer,
	date timestamp,
	source text,
	title text,
	sentiment_neu double precision
)
;

create unique index events_event_id_uindex
	on events (event_id)
;

create index events_event_type_concept_name_index
	on events (event_type, concept_name)
;

create index events_event_type_concept_code_index
	on events (event_type, concept_code)
;

create index events_event_type_concept_id_index
	on events (event_type, concept_id)
;

create index events_concept_name_index
	on events (concept_name)
;

create index events_concept_code_index
	on events (concept_code)
;

create index events_concept_id_index
	on events (concept_id)
;

create table article_event
(
	level_0 text,
	level_1 text,
	"Drug" text,
	"PublicationDate" text,
	"Headline" text,
	"Type" text,
	"SectionName" text,
	"Text" text
)
;

create index ix_article_event_level_0
	on article_event (level_0)
;

create index ix_article_event_level_1
	on article_event (level_1)
;
