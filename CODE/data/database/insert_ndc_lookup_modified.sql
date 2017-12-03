
insert into ndc_lookup
(ndc_concept_id, ndc_concept_code, ndc_concept_name, rxnorm_concept_id, rxnorm_concept_code, rxnorm_concept_name)
SELECT
 -- c2.concept_class_id,
--  c3.concept_class_id,
 -- c4.concept_class_id,
  ndc.concept_id as ndc_concept_id,
  ndc.concept_code as ndc_concept_code,
  ndc.concept_name as ndc_concept_name,
  c4.concept_id as rxnorm_concept_id,
  c4.concept_code as rxnorm_concept_code,
  c4.concept_name as rxnorm_concept_name

  FROM
  concept ndc
inner join concept_relationship rel1
  on rel1.concept_id_1 = ndc.concept_id
inner join concept c2
  on rel1.concept_id_2 = c2.concept_id
inner join concept_relationship rel2
    on rel2.concept_id_1 = c2.concept_id
inner join concept c3
    on rel2.concept_id_2 = c3.concept_id

inner join concept_relationship rel3
    on rel3.concept_id_1 = c3.concept_id
inner join concept c4
    on rel3.concept_id_2 = c4.concept_id
where ndc.vocabulary_id = 'NDC'
  and c2.vocabulary_id = 'RxNorm'
  and c3.vocabulary_id = 'RxNorm'
  and c4.vocabulary_id = 'RxNorm'
  and c4.concept_class_id = 'Ingredient'
  and c2.concept_class_id  in ('Clinical Drug', 'Quant Clinical Drug')
  and c3.concept_class_id in ('Clinical Drug Form', 'Clinical Drug Comp')
;
