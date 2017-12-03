UPDATE medicaid_data as md
SET concept_id = c.concept_id,
  concept_name = c.concept_name,
  concept_code = c.concept_code
FROM concept c
where (lower(c.concept_name) = lower(split_part(product_name, ' ', 1)) OR
 lower(c.concept_code) = lower(split_part(product_name, ' ', 1)))
and md.concept_code is null
and c.vocabulary_id='RxNorm' and c.concept_class_id = 'Ingredient';


