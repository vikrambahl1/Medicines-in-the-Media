SELECT
  ndc.concept_id as ndc_concept_id,
  ndc.concept_code as ndc_concept_code,
  ndc.concept_name as ndc_concept_name,
    c3.concept_id as rxnorm_concept_id,
  c3.concept_code as rxnorm_concept_code,
  c3.concept_name as rxnorm_concept_name
  FROM
  synpuf5.concept ndc
inner join synpuf5.concept_relationship rel1
  on rel1.concept_id_1 = ndc.concept_id
inner join synpuf5.concept c2
  on rel1.concept_id_2 = c2.concept_id
inner join synpuf5.concept_relationship rel2
    on rel2.concept_id_1 = c2.concept_id
inner join synpuf5.concept c3
    on rel2.concept_id_2 = c3.concept_id
where ndc.vocabulary_id = 'NDC'
  and c2.vocabulary_id = 'RxNorm'
  and c3.vocabulary_id ='RxNorm'
  and c3.concept_class_id = 'Ingredient'
and rel1.relationship_id = 'Maps to'
union all
SELECT
  ndc.concept_id as ndc_concept_id,
  ndc.concept_code as ndc_concept_code,
  ndc.concept_name as ndc_concept_name,
    c4.concept_id as rxnorm_concept_id,
  c4.concept_code as rxnorm_concept_code,
  c4.concept_name as rxnorm_concept_name
  FROM
  synpuf5.concept ndc
inner join synpuf5.concept_relationship rel1
  on rel1.concept_id_1 = ndc.concept_id
inner join synpuf5.concept c2
  on rel1.concept_id_2 = c2.concept_id
inner join synpuf5.concept_relationship rel2
    on rel2.concept_id_1 = c2.concept_id
inner join synpuf5.concept c3
    on rel2.concept_id_2 = c3.concept_id
inner join synpuf5.concept_relationship rel3
on rel3.concept_id_1 = c3.concept_id
inner join synpuf5.concept c4
    on rel3.concept_id_2 = c4.concept_id
where ndc.vocabulary_id = 'NDC'
  and c2.vocabulary_id = 'RxNorm'
  and c3.vocabulary_id ='RxNorm'
  and c4.vocabulary_id ='RxNorm'
  and c3.concept_class_id = 'Brand Name'
  and c4.concept_class_id = 'Ingredient'
and rel1.relationship_id = 'Maps to'
union all
SELECT
  ndc.concept_id as ndc_concept_id,
  ndc.concept_code as ndc_concept_code,
  ndc.concept_name as ndc_concept_name,
    c5.concept_id as rxnorm_concept_id,
  c5.concept_code as rxnorm_concept_code,
  c5.concept_name as rxnorm_concept_name
  FROM
  synpuf5.concept ndc
inner join synpuf5.concept_relationship rel1
  on rel1.concept_id_1 = ndc.concept_id
inner join synpuf5.concept c2
  on rel1.concept_id_2 = c2.concept_id
inner join synpuf5.concept_relationship rel2
    on rel2.concept_id_1 = c2.concept_id
inner join synpuf5.concept c3
    on rel2.concept_id_2 = c3.concept_id
inner join synpuf5.concept_relationship rel3
on rel3.concept_id_1 = c3.concept_id

inner join synpuf5.concept c4
    on rel3.concept_id_2 = c4.concept_id

    inner join synpuf5.concept_relationship rel4
on rel4.concept_id_1 = c4.concept_id

inner join synpuf5.concept c5
    on rel4.concept_id_2 = c5.concept_id
where ndc.vocabulary_id = 'NDC'
  and c2.vocabulary_id = 'RxNorm'
  and c3.vocabulary_id ='RxNorm'
  and c4.vocabulary_id ='RxNorm'
  and c3.concept_class_id = 'Brand Name'
  and c4.concept_class_id = 'Brand Name'
  and c5.concept_class_id = 'Ingredient'
and rel1.relationship_id = 'Maps to'

