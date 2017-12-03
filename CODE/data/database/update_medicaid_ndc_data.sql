UPDATE "medicaid_data" md
SET
  concept_id = "ndc"."rxnorm_concept_id",
  concept_name="ndc"."rxnorm_concept_name",
  concept_code="ndc"."rxnorm_concept_code"

  FROM
  "ndc_lookup" "ndc"

WHERE "ndc"."ndc_concept_code"=md."ndc";