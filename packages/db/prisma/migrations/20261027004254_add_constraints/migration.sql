-- ============================================================
-- constraints.sql  ->  20261027004254_add_constraints/migration.sql
-- Rules Prisma cannot express. Applied ONCE after the Prisma-generated
-- init migration that created the tables.
-- ============================================================

-- ------------------------------------------------------------
-- 0. Extensions
-- ------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- ------------------------------------------------------------
-- 1. One-of-a-kind rules (partial unique indexes)
-- ------------------------------------------------------------

CREATE UNIQUE INDEX IF NOT EXISTS "nutritionGoal_one_active_per_profile"
  ON "nutritionGoal" ("profileId")
  WHERE "status" = 'ACTIVE';

CREATE UNIQUE INDEX IF NOT EXISTS "fastingLog_one_open_per_profile"
  ON "fastingLog" ("profileId")
  WHERE "endedAt" IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS "foodServing_one_default_per_food"
  ON "foodServing" ("foodId")
  WHERE "isDefault" = true;

CREATE UNIQUE INDEX IF NOT EXISTS "reminder_one_water_per_profile"
  ON "reminder" ("profileId")
  WHERE "kind" = 'WATER';

CREATE UNIQUE INDEX IF NOT EXISTS "reminder_one_meal_per_type"
  ON "reminder" ("profileId", "mealType")
  WHERE "kind" = 'MEAL';

CREATE UNIQUE INDEX IF NOT EXISTS "reminder_one_fasting_per_phase"
  ON "reminder" ("profileId", "fastingPhase")
  WHERE "kind" = 'FASTING';

CREATE UNIQUE INDEX IF NOT EXISTS "notificationDelivery_unique_nonpush"
  ON "notificationDelivery" ("notificationId", "channel")
  WHERE "pushDeviceId" IS NULL AND "channel" <> 'PUSH';

CREATE UNIQUE INDEX IF NOT EXISTS "notificationDelivery_unique_push"
  ON "notificationDelivery" ("notificationId", "pushDeviceId")
  WHERE "pushDeviceId" IS NOT NULL;

-- ------------------------------------------------------------
-- 2. Exclusion constraints
-- ------------------------------------------------------------

ALTER TABLE "mealPlan"
  ADD CONSTRAINT "mealPlan_no_overlapping_active"
  EXCLUDE USING gist (
    "profileId" WITH =,
    daterange("startDate", "endDate", '[]') WITH &&
  )
  WHERE ("status" = 'ACTIVE');

ALTER TABLE "nutrientReference"
  ADD CONSTRAINT "nutrientReference_no_overlap_any_gender"
  EXCLUDE USING gist (
    "nutrientId" WITH =,
    "lifeStage" WITH =,
    int4range("ageMinYears", "ageMaxYears", '[]') WITH &&
  )
  WHERE ("gender" IS NULL);

ALTER TABLE "nutrientReference"
  ADD CONSTRAINT "nutrientReference_no_overlap_by_gender"
  EXCLUDE USING gist (
    "nutrientId" WITH =,
    "gender" WITH =,
    "lifeStage" WITH =,
    int4range("ageMinYears", "ageMaxYears", '[]') WITH &&
  )
  WHERE ("gender" IS NOT NULL);

-- ------------------------------------------------------------
-- 3. Fuzzy-search indexes
-- ------------------------------------------------------------

CREATE INDEX IF NOT EXISTS "food_name_trgm"
  ON "food" USING gin (lower("name") gin_trgm_ops);

CREATE INDEX IF NOT EXISTS "foodAlias_alias_trgm"
  ON "foodAlias" USING gin ("alias" gin_trgm_ops);

-- ------------------------------------------------------------
-- 4. CHECK constraints
-- ------------------------------------------------------------

ALTER TABLE "nutritionProfile"
  ADD CONSTRAINT "nutritionProfile_heightCm_range"
    CHECK ("heightCm" IS NULL OR "heightCm" BETWEEN 50 AND 272),
  ADD CONSTRAINT "nutritionProfile_mealsPerDay_range"
    CHECK ("mealsPerDay" IS NULL OR "mealsPerDay" BETWEEN 1 AND 10),
  ADD CONSTRAINT "nutritionProfile_waterTargetMl_range"
    CHECK ("waterTargetMl" BETWEEN 500 AND 10000),
  ADD CONSTRAINT "nutritionProfile_foodBudget_nonneg"
    CHECK ("foodBudget" IS NULL OR "foodBudget" >= 0),
  ADD CONSTRAINT "nutritionProfile_quietHours_format"
    CHECK (
      ("quietHoursStart" IS NULL AND "quietHoursEnd" IS NULL)
      OR (
        "quietHoursStart" ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'
        AND "quietHoursEnd" ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'
      )
    );

ALTER TABLE "onboardingAnswer"
  ADD CONSTRAINT "onboardingAnswer_attempts_positive" CHECK ("attempts" >= 1);

ALTER TABLE "nutritionGoal"
  ADD CONSTRAINT "nutritionGoal_targets_valid"
    CHECK ("dailyKcal" > 0 AND "proteinG" >= 0 AND "carbsG" >= 0 AND "fatG" >= 0 AND "fiberG" >= 0),
  ADD CONSTRAINT "nutritionGoal_weights_valid"
    CHECK (
      ("startWeightKg" IS NULL OR "startWeightKg" BETWEEN 20 AND 500)
      AND ("targetWeightKg" IS NULL OR "targetWeightKg" BETWEEN 20 AND 500)
    ),
  ADD CONSTRAINT "nutritionGoal_dates_ordered"
    CHECK ("endDate" IS NULL OR "endDate" >= "startDate");

ALTER TABLE "weightLog"
  ADD CONSTRAINT "weightLog_weight_range" CHECK ("weightKg" BETWEEN 20 AND 500);

ALTER TABLE "food"
  ADD CONSTRAINT "food_nutrition_nonneg"
    CHECK (
      "kcalPer100g" >= 0 AND "proteinPer100g" >= 0 AND "carbsPer100g" >= 0
      AND "fatPer100g" >= 0 AND ("fiberPer100g" IS NULL OR "fiberPer100g" >= 0)
    ),
  ADD CONSTRAINT "food_density_positive"
    CHECK ("densityGPerMl" IS NULL OR "densityGPerMl" > 0);

ALTER TABLE "food"
  ADD CONSTRAINT "food_animalDerived_consistent"
    CHECK (
      "containsAnimalDerived" IS DISTINCT FROM false
      OR (
        "containsMeatOrPoultry" IS NOT TRUE AND "containsFishOrSeafood" IS NOT TRUE
        AND "containsEgg" IS NOT TRUE AND "containsDairy" IS NOT TRUE
      )
    );

ALTER TABLE "foodAlias"
  ADD CONSTRAINT "foodAlias_lowercase" CHECK ("alias" = lower("alias"));

ALTER TABLE "foodServing"
  ADD CONSTRAINT "foodServing_grams_positive" CHECK ("grams" > 0);

ALTER TABLE "foodNutrient"
  ADD CONSTRAINT "foodNutrient_amount_nonneg" CHECK ("amountPer100g" >= 0);

ALTER TABLE "nutrientReference"
  ADD CONSTRAINT "nutrientReference_age_ordered"
    CHECK ("ageMinYears" >= 0 AND "ageMaxYears" >= "ageMinYears"),
  ADD CONSTRAINT "nutrientReference_values_valid"
    CHECK ("rda" > 0 AND ("upperLimit" IS NULL OR "upperLimit" >= "rda"));

ALTER TABLE "foodPrice"
  ADD CONSTRAINT "foodPrice_price_nonneg" CHECK ("price" >= 0);

ALTER TABLE "scan"
  ADD CONSTRAINT scan_meal_state_valid
  CHECK (
    "type" <> 'MEAL'
    OR (
      ("status" = 'PROCESSING' AND "mealLogId" IS NULL)
      OR ("status" = 'COMPLETE' AND "mealLogId" IS NOT NULL)
      OR ("status" IN ('FAILED', 'REFUSED') AND "mealLogId" IS NULL)
    )
  );

ALTER TABLE "scan"
  ADD CONSTRAINT scan_ingredient_has_no_meal_log
  CHECK ("type" <> 'INGREDIENT_LABEL' OR "mealLogId" IS NULL);

ALTER TABLE "scan"
  ADD CONSTRAINT scan_quality_score_range
  CHECK ("qualityScore" IS NULL OR ("qualityScore" >= 0 AND "qualityScore" <= 100));

ALTER TABLE "scan"
  ADD CONSTRAINT scan_session_only_for_ingredient
  CHECK ("type" = 'INGREDIENT_LABEL' OR "scanSessionId" IS NULL);

ALTER TABLE "scan"
  ADD CONSTRAINT "scan_imageBytes_positive"
  CHECK ("imageBytes" IS NULL OR "imageBytes" > 0);

ALTER TABLE "scanSession"
  ADD CONSTRAINT "scanSession_type_ingredient_only"
  CHECK ("type" = 'INGREDIENT_LABEL');

ALTER TABLE "mealItem"
  ADD CONSTRAINT "mealItem_amounts_valid"
    CHECK ("quantity" > 0 AND "grams" > 0),
  ADD CONSTRAINT "mealItem_nutrition_nonneg"
    CHECK (
      "kcal" >= 0 AND "proteinG" >= 0 AND "carbsG" >= 0
      AND "fatG" >= 0 AND ("fiberG" IS NULL OR "fiberG" >= 0)
    ),
  ADD CONSTRAINT "mealItem_confidence_range"
    CHECK ("confidence" IS NULL OR "confidence" BETWEEN 0 AND 1),
  ADD CONSTRAINT "mealItem_cost_nonneg"
    CHECK ("estimatedCost" IS NULL OR "estimatedCost" >= 0);

ALTER TABLE "barcodeProduct"
  ADD CONSTRAINT "barcodeProduct_barcode_format" CHECK ("barcode" ~ '^[0-9]{8,14}$'),
  ADD CONSTRAINT "barcodeProduct_nutrition_nonneg"
    CHECK (
      ("kcal" IS NULL OR "kcal" >= 0) AND ("protein" IS NULL OR "protein" >= 0)
      AND ("carbs" IS NULL OR "carbs" >= 0) AND ("sugar" IS NULL OR "sugar" >= 0)
      AND ("fiber" IS NULL OR "fiber" >= 0) AND ("sodiumMg" IS NULL OR "sodiumMg" >= 0)
      AND ("fat" IS NULL OR "fat" >= 0) AND ("servingG" IS NULL OR "servingG" > 0)
    );

ALTER TABLE "barcodeScan"
  ADD CONSTRAINT "barcodeScan_qualityScore_range"
    CHECK ("qualityScore" IS NULL OR "qualityScore" BETWEEN 0 AND 100);

ALTER TABLE "dailyNutritionSummary"
  ADD CONSTRAINT "dailyNutritionSummary_values_nonneg"
    CHECK (
      "kcal" >= 0 AND "proteinG" >= 0 AND "carbsG" >= 0 AND "fatG" >= 0 AND "fiberG" >= 0
      AND "waterMl" >= 0 AND "purchaseSpend" >= 0 AND "consumptionCostEstimate" >= 0
      AND "mealCount" >= 0
    );

ALTER TABLE "insight"
  ADD CONSTRAINT "insight_period_ordered" CHECK ("periodEnd" >= "periodStart");

ALTER TABLE "mealPlan"
  ADD CONSTRAINT "mealPlan_dates_ordered" CHECK ("endDate" >= "startDate"),
  ADD CONSTRAINT "mealPlan_max_31_days" CHECK ("endDate" - "startDate" <= 30);

ALTER TABLE "mealPlanItem"
  ADD CONSTRAINT "mealPlanItem_values_valid"
    CHECK (
      "grams" > 0 AND "kcal" >= 0 AND "proteinG" >= 0 AND "carbsG" >= 0 AND "fatG" >= 0
      AND ("fiberG" IS NULL OR "fiberG" >= 0)
      AND ("estimatedCost" IS NULL OR "estimatedCost" >= 0)
    );

ALTER TABLE "pantryItem"
  ADD CONSTRAINT pantry_base_quantity_pair
  CHECK (
    ("quantityBase" IS NULL AND "baseUnit" IS NULL)
    OR ("quantityBase" IS NOT NULL AND "baseUnit" IS NOT NULL)
  ),
  ADD CONSTRAINT "pantryItem_quantity_nonneg"
  CHECK (("quantity" IS NULL OR "quantity" >= 0) AND ("quantityBase" IS NULL OR "quantityBase" >= 0));

ALTER TABLE "groceryItem"
  ADD CONSTRAINT grocery_base_quantity_pair
  CHECK (
    ("quantityBase" IS NULL AND "baseUnit" IS NULL)
    OR ("quantityBase" IS NOT NULL AND "baseUnit" IS NOT NULL)
  ),
  ADD CONSTRAINT "groceryItem_quantity_positive"
  CHECK ("quantity" > 0 AND ("quantityBase" IS NULL OR "quantityBase" > 0)),
  ADD CONSTRAINT "groceryItem_cost_nonneg"
  CHECK ("estimatedCost" IS NULL OR "estimatedCost" >= 0);

ALTER TABLE "groceryList"
  ADD CONSTRAINT "groceryList_total_nonneg"
  CHECK ("estimatedTotal" IS NULL OR "estimatedTotal" >= 0);

ALTER TABLE "expenseLog"
  ADD CONSTRAINT "expenseLog_amount_positive" CHECK ("amount" > 0);

ALTER TABLE "waterLog"
  ADD CONSTRAINT "waterLog_amount_range" CHECK ("amountMl" BETWEEN 1 AND 5000);

ALTER TABLE "fastingLog"
  ADD CONSTRAINT "fastingLog_end_after_start"
    CHECK ("endedAt" IS NULL OR "endedAt" >= "startedAt"),
  ADD CONSTRAINT "fastingLog_target_positive"
    CHECK ("targetMinutes" IS NULL OR "targetMinutes" > 0);

ALTER TABLE "reminder"
  ADD CONSTRAINT "reminder_water_shape"
    CHECK ("kind" <> 'WATER' OR (
      "mealType" IS NULL AND "fastingPhase" IS NULL
      AND "endTime" IS NOT NULL AND "intervalMin" IS NOT NULL AND "intervalMin" > 0
    )),
  ADD CONSTRAINT "reminder_meal_shape"
    CHECK ("kind" <> 'MEAL' OR (
      "mealType" IS NOT NULL AND "endTime" IS NULL
      AND "intervalMin" IS NULL AND "fastingPhase" IS NULL
    )),
  ADD CONSTRAINT "reminder_fasting_shape"
    CHECK ("kind" <> 'FASTING' OR (
      "fastingPhase" IS NOT NULL AND "mealType" IS NULL
      AND "endTime" IS NULL AND "intervalMin" IS NULL
    )),
  ADD CONSTRAINT "reminder_time_format"
    CHECK (
      "startTime" ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'
      AND ("endTime" IS NULL OR "endTime" ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$')
    ),
  ADD CONSTRAINT "reminder_daysOfWeek_valid"
    CHECK (
      "daysOfWeek" <@ ARRAY[1,2,3,4,5,6,7]
      AND (NOT "enabled" OR cardinality("daysOfWeek") > 0)
    );

ALTER TABLE "notificationPreference"
  ADD CONSTRAINT "notificationPreference_security_always_on"
    CHECK ("category" <> 'SECURITY' OR "enabled" = true);

ALTER TABLE "notificationDelivery"
  ADD CONSTRAINT "notificationDelivery_push_needs_device"
    CHECK (("channel" = 'PUSH') = ("pushDeviceId" IS NOT NULL)),
  ADD CONSTRAINT "notificationDelivery_attempts_nonneg" CHECK ("attempts" >= 0);

ALTER TABLE "referralInvitation"
  ADD CONSTRAINT "referralInvitation_no_self_invite"
    CHECK ("acceptedById" IS NULL OR "acceptedById" <> "invitedById"),
  ADD CONSTRAINT "referralInvitation_accepted_consistent"
    CHECK (("status" = 'ACCEPTED') = ("acceptedById" IS NOT NULL AND "acceptedAt" IS NOT NULL));
