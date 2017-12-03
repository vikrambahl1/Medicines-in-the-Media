INSERT into
  npi_lookup (npi, first_name, last_name, city, state, specialty, description)
select DISTINCT
  cast (npi as VARCHAR(10)),
    cast(nppes_provider_last_org_name as VARCHAR(255)),
    cast(nppes_provider_first_name as VARCHAR(255)),
    cast(nppes_provider_city as VARCHAR(255)),
    cast(nppes_provider_state as VARCHAR(255)),
    cast(specialty_description as VARCHAR(255)),
    cast(description_flag as VARCHAR(255))
  from medicare_2013