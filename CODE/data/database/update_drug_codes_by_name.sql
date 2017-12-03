

UPDATE medicaid_data
SET md.concept_id = c.concept_id,
  md.concept_name = c.concept_name,
  md.concept_code = c.concept_code
FROM medicaid_data md
JOIN concept c
    ON lower(c.concept_name) = lower(md.product_name)
WHERE md.concept_id is null
and c.vocabulary_id='RxNorm' and c.concept_class_id = 'Ingredient';



UPDATE md
SET concept_id = c.concept_id,
  concept_name = c.concept_name,
  concept_code = c.concept_code
FROM medicare_data md
JOIN concept c
    ON lower(c.concept_name) = lower(md.drug_name)
WHERE md.concept_id is null
and c.vocabulary_id='RxNorm' and c.concept_class_id = 'Ingredient';