/*
  Warnings:

  - A unique constraint covering the columns `[username]` on the table `user` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY');

-- CreateEnum
CREATE TYPE "ActivityLevel" AS ENUM ('SEDENTARY', 'LIGHT', 'MODERATE', 'ACTIVE', 'VERY_ACTIVE');

-- CreateEnum
CREATE TYPE "LifeStage" AS ENUM ('GENERAL', 'PREGNANT', 'LACTATING');

-- CreateEnum
CREATE TYPE "DietType" AS ENUM ('VEGAN', 'VEGETARIAN', 'EGGETARIAN', 'PESCATARIAN', 'NON_VEGETARIAN', 'FLEXITARIAN');

-- CreateEnum
CREATE TYPE "DietaryApproach" AS ENUM ('KETO', 'PALEO', 'LOW_CARB', 'HIGH_PROTEIN', 'MEDITERRANEAN');

-- CreateEnum
CREATE TYPE "DietaryPracticeType" AS ENUM ('JAIN', 'SATTVIC', 'NO_ONION_GARLIC', 'HALAL', 'KOSHER');

-- CreateEnum
CREATE TYPE "Allergen" AS ENUM ('PEANUT', 'TREE_NUT', 'MILK', 'EGG', 'SOY', 'GLUTEN', 'FISH', 'SHELLFISH', 'SESAME', 'MUSTARD');

-- CreateEnum
CREATE TYPE "RestrictionType" AS ENUM ('ALLERGY', 'INTOLERANCE');

-- CreateEnum
CREATE TYPE "MealType" AS ENUM ('BREAKFAST', 'MORNING_SNACK', 'LUNCH', 'EVENING_SNACK', 'DINNER', 'LATE_NIGHT_SNACK');

-- CreateEnum
CREATE TYPE "MealItemSource" AS ENUM ('AI', 'MANUAL', 'BARCODE');

-- CreateEnum
CREATE TYPE "FoodPreferenceType" AS ENUM ('LIKE', 'DISLIKE');

-- CreateEnum
CREATE TYPE "FoodCatalogStatus" AS ENUM ('VERIFIED', 'UNVERIFIED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "FoodDataSource" AS ENUM ('IFCT', 'USDA', 'OPEN_FOOD_FACTS', 'AI_ESTIMATE', 'ADMIN');

-- CreateEnum
CREATE TYPE "BaseUnit" AS ENUM ('GRAM', 'MILLILITRE', 'PIECE');

-- CreateEnum
CREATE TYPE "PriceBasis" AS ENUM ('PER_KG', 'PER_LITRE', 'PER_PIECE');

-- CreateEnum
CREATE TYPE "FoodPriceSource" AS ENUM ('ADMIN', 'USER_REPORTED', 'PROVIDER');

-- CreateEnum
CREATE TYPE "GoalType" AS ENUM ('WEIGHT_LOSS', 'WEIGHT_GAIN', 'WEIGHT_MAINTENANCE', 'MUSCLE_GAIN', 'BALANCED_NUTRITION');

-- CreateEnum
CREATE TYPE "GoalStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'PAUSED', 'ABANDONED');

-- CreateEnum
CREATE TYPE "BudgetPeriod" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY');

-- CreateEnum
CREATE TYPE "ScanType" AS ENUM ('MEAL', 'INGREDIENT_LABEL');

-- CreateEnum
CREATE TYPE "ScanStatus" AS ENUM ('PROCESSING', 'COMPLETE', 'FAILED', 'REFUSED');

-- CreateEnum
CREATE TYPE "HealthVerdict" AS ENUM ('GOOD_FIT', 'MIXED', 'LIMITED_FIT', 'INSUFFICIENT_DATA');

-- CreateEnum
CREATE TYPE "MealPlanStatus" AS ENUM ('DRAFT', 'ACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "GroceryListStatus" AS ENUM ('ACTIVE', 'COMPLETED');

-- CreateEnum
CREATE TYPE "ExpenseCategory" AS ENUM ('GROCERY', 'EATING_OUT', 'OTHER');

-- CreateEnum
CREATE TYPE "ReminderKind" AS ENUM ('WATER', 'MEAL', 'FASTING');

-- CreateEnum
CREATE TYPE "FastingReminderPhase" AS ENUM ('START', 'END');

-- CreateEnum
CREATE TYPE "InsightPeriod" AS ENUM ('WEEK', 'MONTH');

-- CreateEnum
CREATE TYPE "ChatRole" AS ENUM ('USER', 'ASSISTANT');

-- CreateEnum
CREATE TYPE "OnboardingStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED', 'ABANDONED');

-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('IN_APP', 'PUSH', 'EMAIL');

-- CreateEnum
CREATE TYPE "NotificationCategory" AS ENUM ('MEAL_REMINDER', 'WATER_REMINDER', 'FASTING_REMINDER', 'GOAL_PROGRESS', 'WEEKLY_SUMMARY', 'BUDGET_ALERT', 'REFERRAL', 'SECURITY', 'SYSTEM');

-- CreateEnum
CREATE TYPE "DeliveryStatus" AS ENUM ('PENDING', 'SENT', 'FAILED', 'SKIPPED');

-- CreateEnum
CREATE TYPE "DevicePlatform" AS ENUM ('IOS', 'ANDROID');

-- CreateEnum
CREATE TYPE "ReferralInvitationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'EXPIRED', 'REVOKED');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('TRIALING', 'ACTIVE', 'GRACE_PERIOD', 'BILLING_RETRY', 'CANCELED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "SubscriptionStore" AS ENUM ('APP_STORE', 'PLAY_STORE', 'ADMIN');

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "deactivatedAt" TIMESTAMP(3),
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ALTER COLUMN "role" SET DEFAULT 'user';

-- CreateTable
CREATE TABLE "nutritionProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "gender" "Gender",
    "dateOfBirth" DATE,
    "heightCm" DECIMAL(5,2),
    "activityLevel" "ActivityLevel",
    "lifeStage" "LifeStage" NOT NULL DEFAULT 'GENERAL',
    "dietType" "DietType",
    "approaches" "DietaryApproach"[],
    "practices" "DietaryPracticeType"[],
    "cuisines" TEXT[],
    "mealsPerDay" INTEGER,
    "countryCode" TEXT NOT NULL DEFAULT 'IN',
    "regionCode" TEXT,
    "city" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "timeZone" TEXT NOT NULL DEFAULT 'Asia/Kolkata',
    "foodBudget" DECIMAL(10,2),
    "budgetPeriod" "BudgetPeriod" NOT NULL DEFAULT 'MONTHLY',
    "waterTargetMl" INTEGER NOT NULL DEFAULT 2500,
    "quietHoursStart" TEXT,
    "quietHoursEnd" TEXT,
    "onboardedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "nutritionProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dietaryRestriction" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "allergen" "Allergen" NOT NULL,
    "type" "RestrictionType" NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dietaryRestriction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "onboardingSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "OnboardingStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "onboardingSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "onboardingAnswer" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "questionKey" TEXT NOT NULL,
    "confirmedValue" JSONB NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 1,
    "confirmedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "onboardingAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nutritionGoal" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "type" "GoalType" NOT NULL,
    "status" "GoalStatus" NOT NULL DEFAULT 'ACTIVE',
    "startWeightKg" DECIMAL(5,2),
    "targetWeightKg" DECIMAL(5,2),
    "dailyKcal" INTEGER NOT NULL,
    "proteinG" INTEGER NOT NULL,
    "carbsG" INTEGER NOT NULL,
    "fatG" INTEGER NOT NULL,
    "fiberG" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "nutritionGoal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "weightLog" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "weightKg" DECIMAL(5,2) NOT NULL,
    "localDate" DATE NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "weightLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "food" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "cuisine" TEXT,
    "status" "FoodCatalogStatus" NOT NULL DEFAULT 'UNVERIFIED',
    "source" "FoodDataSource" NOT NULL DEFAULT 'ADMIN',
    "containsMeatOrPoultry" BOOLEAN,
    "containsFishOrSeafood" BOOLEAN,
    "containsEgg" BOOLEAN,
    "containsDairy" BOOLEAN,
    "containsAnimalDerived" BOOLEAN,
    "containsOnionGarlic" BOOLEAN,
    "allergens" "Allergen"[],
    "allergensVerified" BOOLEAN NOT NULL DEFAULT false,
    "practiceConflicts" "DietaryPracticeType"[],
    "practiceConflictsVerified" BOOLEAN NOT NULL DEFAULT false,
    "kcalPer100g" DECIMAL(7,2) NOT NULL,
    "proteinPer100g" DECIMAL(6,2) NOT NULL,
    "carbsPer100g" DECIMAL(6,2) NOT NULL,
    "fatPer100g" DECIMAL(6,2) NOT NULL,
    "fiberPer100g" DECIMAL(6,2),
    "densityGPerMl" DECIMAL(6,3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "food_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "foodAlias" (
    "id" TEXT NOT NULL,
    "foodId" TEXT NOT NULL,
    "alias" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'en',

    CONSTRAINT "foodAlias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "foodServing" (
    "id" TEXT NOT NULL,
    "foodId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "grams" DECIMAL(7,2) NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "foodServing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nutrient" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "unit" TEXT NOT NULL,

    CONSTRAINT "nutrient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "foodNutrient" (
    "foodId" TEXT NOT NULL,
    "nutrientId" TEXT NOT NULL,
    "amountPer100g" DECIMAL(10,3) NOT NULL,

    CONSTRAINT "foodNutrient_pkey" PRIMARY KEY ("foodId","nutrientId")
);

-- CreateTable
CREATE TABLE "nutrientReference" (
    "id" TEXT NOT NULL,
    "nutrientId" TEXT NOT NULL,
    "gender" "Gender",
    "lifeStage" "LifeStage" NOT NULL DEFAULT 'GENERAL',
    "ageMinYears" INTEGER NOT NULL,
    "ageMaxYears" INTEGER NOT NULL,
    "rda" DECIMAL(10,3) NOT NULL,
    "upperLimit" DECIMAL(10,3),
    "source" TEXT,

    CONSTRAINT "nutrientReference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "foodPrice" (
    "id" TEXT NOT NULL,
    "foodId" TEXT NOT NULL,
    "regionCode" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "basis" "PriceBasis" NOT NULL DEFAULT 'PER_KG',
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "source" "FoodPriceSource" NOT NULL DEFAULT 'ADMIN',
    "observedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "foodPrice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "foodPreference" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "foodId" TEXT NOT NULL,
    "type" "FoodPreferenceType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "foodPreference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scanSession" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "type" "ScanType" NOT NULL,
    "localDate" DATE NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "scanSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scan" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "type" "ScanType" NOT NULL,
    "status" "ScanStatus" NOT NULL DEFAULT 'PROCESSING',
    "errorCode" TEXT,
    "localDate" DATE NOT NULL,
    "photoKey" TEXT NOT NULL,
    "mimeType" TEXT,
    "imageBytes" INTEGER,
    "photoUploadedAt" TIMESTAMP(3),
    "productName" TEXT,
    "verdict" "HealthVerdict",
    "qualityScore" INTEGER,
    "detectedAllergens" "Allergen"[],
    "flaggedAdditives" TEXT[],
    "result" JSONB,
    "resultVersion" INTEGER NOT NULL DEFAULT 1,
    "mealLogId" TEXT,
    "scanSessionId" TEXT,
    "aiModel" TEXT,
    "inputTokens" INTEGER,
    "outputTokens" INTEGER,
    "costMicroUsd" INTEGER,
    "latencyMs" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "scan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mealLog" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "mealType" "MealType" NOT NULL,
    "loggedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "localDate" DATE NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mealLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mealPhoto" (
    "id" TEXT NOT NULL,
    "mealLogId" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mealPhoto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mealItem" (
    "id" TEXT NOT NULL,
    "mealLogId" TEXT NOT NULL,
    "foodId" TEXT,
    "barcodeProductId" TEXT,
    "name" TEXT NOT NULL,
    "quantity" DECIMAL(8,2) NOT NULL,
    "unit" TEXT NOT NULL,
    "grams" DECIMAL(8,2) NOT NULL,
    "source" "MealItemSource" NOT NULL DEFAULT 'AI',
    "confidence" DECIMAL(3,2),
    "kcal" DECIMAL(7,2) NOT NULL,
    "proteinG" DECIMAL(6,2) NOT NULL,
    "carbsG" DECIMAL(6,2) NOT NULL,
    "fatG" DECIMAL(6,2) NOT NULL,
    "fiberG" DECIMAL(6,2),
    "micros" JSONB,
    "estimatedCost" DECIMAL(10,2),

    CONSTRAINT "mealItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "barcodeProduct" (
    "id" TEXT NOT NULL,
    "barcode" TEXT NOT NULL,
    "name" TEXT,
    "brands" TEXT[],
    "imageUrl" TEXT,
    "ingredientsText" TEXT,
    "servingG" DECIMAL(8,2),
    "kcal" DECIMAL(7,2),
    "protein" DECIMAL(6,2),
    "carbs" DECIMAL(6,2),
    "sugar" DECIMAL(6,2),
    "fiber" DECIMAL(6,2),
    "sodiumMg" DECIMAL(8,2),
    "fat" DECIMAL(6,2),
    "nutriscore" TEXT,
    "nutriments" JSONB,
    "notFound" BOOLEAN NOT NULL DEFAULT false,
    "source" TEXT NOT NULL DEFAULT 'open_food_facts',
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "barcodeProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "barcodeScan" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "localDate" DATE NOT NULL,
    "productNameSnapshot" TEXT,
    "brandsSnapshot" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "nutrimentsSnapshot" JSONB,
    "sourceSnapshot" TEXT,
    "verdict" "HealthVerdict",
    "qualityScore" INTEGER,
    "result" JSONB,
    "resultVersion" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "barcodeScan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dailyNutritionSummary" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "localDate" DATE NOT NULL,
    "kcal" DECIMAL(8,2) NOT NULL DEFAULT 0,
    "proteinG" DECIMAL(7,2) NOT NULL DEFAULT 0,
    "carbsG" DECIMAL(7,2) NOT NULL DEFAULT 0,
    "fatG" DECIMAL(7,2) NOT NULL DEFAULT 0,
    "fiberG" DECIMAL(7,2) NOT NULL DEFAULT 0,
    "micros" JSONB,
    "waterMl" INTEGER NOT NULL DEFAULT 0,
    "purchaseSpend" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "consumptionCostEstimate" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "mealCount" INTEGER NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "kcalTarget" INTEGER,
    "proteinTargetG" INTEGER,
    "carbsTargetG" INTEGER,
    "fatTargetG" INTEGER,
    "fiberTargetG" INTEGER,
    "waterTargetMl" INTEGER,
    "budgetTarget" DECIMAL(10,2),
    "budgetPeriod" "BudgetPeriod",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dailyNutritionSummary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "insight" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "period" "InsightPeriod" NOT NULL,
    "periodStart" DATE NOT NULL,
    "periodEnd" DATE NOT NULL,
    "stats" JSONB NOT NULL,
    "statsVersion" INTEGER NOT NULL DEFAULT 1,
    "narrative" TEXT,
    "aiModel" TEXT,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "insight_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mealPlan" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "startDate" DATE NOT NULL,
    "endDate" DATE NOT NULL,
    "status" "MealPlanStatus" NOT NULL DEFAULT 'DRAFT',
    "estimatedCost" DECIMAL(10,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mealPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mealPlanItem" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "localDate" DATE NOT NULL,
    "mealType" "MealType" NOT NULL,
    "foodId" TEXT,
    "name" TEXT NOT NULL,
    "grams" DECIMAL(8,2) NOT NULL,
    "kcal" DECIMAL(7,2) NOT NULL,
    "proteinG" DECIMAL(6,2) NOT NULL,
    "carbsG" DECIMAL(6,2) NOT NULL,
    "fatG" DECIMAL(6,2) NOT NULL,
    "fiberG" DECIMAL(6,2),
    "estimatedCost" DECIMAL(10,2),

    CONSTRAINT "mealPlanItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pantryItem" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "foodId" TEXT,
    "name" TEXT NOT NULL,
    "quantity" DECIMAL(10,2),
    "unit" TEXT,
    "quantityBase" DECIMAL(12,2),
    "baseUnit" "BaseUnit",
    "expiresOn" DATE,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pantryItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "groceryList" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "mealPlanId" TEXT,
    "status" "GroceryListStatus" NOT NULL DEFAULT 'ACTIVE',
    "estimatedTotal" DECIMAL(10,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "groceryList_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "groceryItem" (
    "id" TEXT NOT NULL,
    "listId" TEXT NOT NULL,
    "foodId" TEXT,
    "name" TEXT NOT NULL,
    "quantity" DECIMAL(10,2) NOT NULL,
    "unit" TEXT NOT NULL,
    "quantityBase" DECIMAL(12,2),
    "baseUnit" "BaseUnit",
    "estimatedCost" DECIMAL(10,2),
    "isChecked" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "groceryItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "expenseLog" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "category" "ExpenseCategory" NOT NULL,
    "localDate" DATE NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "expenseLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chatConversation" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "title" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chatConversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chatMessage" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "role" "ChatRole" NOT NULL,
    "content" TEXT NOT NULL,
    "inputTokens" INTEGER,
    "outputTokens" INTEGER,
    "aiModel" TEXT,
    "costMicroUsd" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chatMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "waterLog" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "amountMl" INTEGER NOT NULL,
    "localDate" DATE NOT NULL,
    "loggedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "waterLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fastingLog" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "endedAt" TIMESTAMP(3),
    "targetMinutes" INTEGER,
    "localDate" DATE NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fastingLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reminder" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "kind" "ReminderKind" NOT NULL,
    "mealType" "MealType",
    "fastingPhase" "FastingReminderPhase",
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT,
    "intervalMin" INTEGER,
    "daysOfWeek" INTEGER[],
    "nextRunAt" TIMESTAMP(3),
    "lastNotifiedAt" TIMESTAMP(3),
    "pausedUntil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reminder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "category" "NotificationCategory" NOT NULL,
    "templateKey" TEXT NOT NULL,
    "variables" JSONB NOT NULL,
    "data" JSONB,
    "dedupeKey" TEXT,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notificationDelivery" (
    "id" TEXT NOT NULL,
    "notificationId" TEXT NOT NULL,
    "channel" "NotificationChannel" NOT NULL,
    "pushDeviceId" TEXT,
    "status" "DeliveryStatus" NOT NULL DEFAULT 'PENDING',
    "providerMessageId" TEXT,
    "error" TEXT,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "renderedSnapshot" JSONB,
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notificationDelivery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pushDevice" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expoPushToken" TEXT NOT NULL,
    "platform" "DevicePlatform" NOT NULL,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pushDevice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notificationPreference" (
    "userId" TEXT NOT NULL,
    "category" "NotificationCategory" NOT NULL,
    "channel" "NotificationChannel" NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "notificationPreference_pkey" PRIMARY KEY ("userId","category","channel")
);

-- CreateTable
CREATE TABLE "referralInvitation" (
    "id" TEXT NOT NULL,
    "invitedById" TEXT NOT NULL,
    "email" TEXT,
    "tokenHash" TEXT NOT NULL,
    "acceptedById" TEXT,
    "status" "ReferralInvitationStatus" NOT NULL DEFAULT 'PENDING',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "acceptedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "referralInvitation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "store" "SubscriptionStore" NOT NULL,
    "productId" TEXT NOT NULL,
    "storeSubscriptionId" TEXT NOT NULL,
    "status" "SubscriptionStatus" NOT NULL,
    "currentPeriodEnd" TIMESTAMP(3) NOT NULL,
    "willRenew" BOOLEAN NOT NULL DEFAULT true,
    "trialEndsAt" TIMESTAMP(3),
    "canceledAt" TIMESTAMP(3),
    "isSandbox" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "billingEvent" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "userId" TEXT,
    "payload" JSONB NOT NULL,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),
    "isSandbox" BOOLEAN NOT NULL DEFAULT false,
    "error" TEXT,

    CONSTRAINT "billingEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "nutritionProfile_userId_key" ON "nutritionProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "dietaryRestriction_profileId_allergen_key" ON "dietaryRestriction"("profileId", "allergen");

-- CreateIndex
CREATE INDEX "onboardingSession_userId_status_idx" ON "onboardingSession"("userId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "onboardingAnswer_sessionId_questionKey_key" ON "onboardingAnswer"("sessionId", "questionKey");

-- CreateIndex
CREATE INDEX "nutritionGoal_profileId_status_idx" ON "nutritionGoal"("profileId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "weightLog_profileId_localDate_key" ON "weightLog"("profileId", "localDate");

-- CreateIndex
CREATE INDEX "food_name_idx" ON "food"("name");

-- CreateIndex
CREATE INDEX "food_status_idx" ON "food"("status");

-- CreateIndex
CREATE INDEX "foodAlias_alias_language_idx" ON "foodAlias"("alias", "language");

-- CreateIndex
CREATE INDEX "foodAlias_foodId_idx" ON "foodAlias"("foodId");

-- CreateIndex
CREATE UNIQUE INDEX "foodAlias_foodId_alias_language_key" ON "foodAlias"("foodId", "alias", "language");

-- CreateIndex
CREATE UNIQUE INDEX "foodServing_foodId_label_key" ON "foodServing"("foodId", "label");

-- CreateIndex
CREATE UNIQUE INDEX "nutrient_code_key" ON "nutrient"("code");

-- CreateIndex
CREATE INDEX "foodNutrient_nutrientId_amountPer100g_idx" ON "foodNutrient"("nutrientId", "amountPer100g");

-- CreateIndex
CREATE INDEX "nutrientReference_nutrientId_gender_lifeStage_idx" ON "nutrientReference"("nutrientId", "gender", "lifeStage");

-- CreateIndex
CREATE INDEX "foodPrice_foodId_regionCode_observedAt_idx" ON "foodPrice"("foodId", "regionCode", "observedAt");

-- CreateIndex
CREATE INDEX "foodPreference_foodId_idx" ON "foodPreference"("foodId");

-- CreateIndex
CREATE UNIQUE INDEX "foodPreference_profileId_foodId_key" ON "foodPreference"("profileId", "foodId");

-- CreateIndex
CREATE INDEX "scanSession_profileId_localDate_idx" ON "scanSession"("profileId", "localDate");

-- CreateIndex
CREATE UNIQUE INDEX "scan_photoKey_key" ON "scan"("photoKey");

-- CreateIndex
CREATE UNIQUE INDEX "scan_mealLogId_key" ON "scan"("mealLogId");

-- CreateIndex
CREATE INDEX "scan_profileId_type_createdAt_idx" ON "scan"("profileId", "type", "createdAt");

-- CreateIndex
CREATE INDEX "scan_profileId_localDate_idx" ON "scan"("profileId", "localDate");

-- CreateIndex
CREATE INDEX "scan_status_createdAt_idx" ON "scan"("status", "createdAt");

-- CreateIndex
CREATE INDEX "scan_scanSessionId_idx" ON "scan"("scanSessionId");

-- CreateIndex
CREATE INDEX "mealLog_profileId_localDate_idx" ON "mealLog"("profileId", "localDate");

-- CreateIndex
CREATE UNIQUE INDEX "mealPhoto_storageKey_key" ON "mealPhoto"("storageKey");

-- CreateIndex
CREATE INDEX "mealPhoto_mealLogId_idx" ON "mealPhoto"("mealLogId");

-- CreateIndex
CREATE INDEX "mealItem_mealLogId_idx" ON "mealItem"("mealLogId");

-- CreateIndex
CREATE INDEX "mealItem_foodId_idx" ON "mealItem"("foodId");

-- CreateIndex
CREATE INDEX "mealItem_barcodeProductId_idx" ON "mealItem"("barcodeProductId");

-- CreateIndex
CREATE UNIQUE INDEX "barcodeProduct_barcode_key" ON "barcodeProduct"("barcode");

-- CreateIndex
CREATE INDEX "barcodeScan_profileId_createdAt_idx" ON "barcodeScan"("profileId", "createdAt");

-- CreateIndex
CREATE INDEX "barcodeScan_profileId_localDate_idx" ON "barcodeScan"("profileId", "localDate");

-- CreateIndex
CREATE UNIQUE INDEX "dailyNutritionSummary_profileId_localDate_key" ON "dailyNutritionSummary"("profileId", "localDate");

-- CreateIndex
CREATE UNIQUE INDEX "insight_profileId_period_periodStart_key" ON "insight"("profileId", "period", "periodStart");

-- CreateIndex
CREATE INDEX "mealPlan_profileId_startDate_idx" ON "mealPlan"("profileId", "startDate");

-- CreateIndex
CREATE INDEX "mealPlanItem_planId_localDate_idx" ON "mealPlanItem"("planId", "localDate");

-- CreateIndex
CREATE INDEX "mealPlanItem_foodId_idx" ON "mealPlanItem"("foodId");

-- CreateIndex
CREATE INDEX "pantryItem_profileId_idx" ON "pantryItem"("profileId");

-- CreateIndex
CREATE INDEX "pantryItem_foodId_idx" ON "pantryItem"("foodId");

-- CreateIndex
CREATE INDEX "groceryList_profileId_status_idx" ON "groceryList"("profileId", "status");

-- CreateIndex
CREATE INDEX "groceryItem_listId_idx" ON "groceryItem"("listId");

-- CreateIndex
CREATE INDEX "expenseLog_profileId_localDate_idx" ON "expenseLog"("profileId", "localDate");

-- CreateIndex
CREATE INDEX "chatConversation_profileId_updatedAt_idx" ON "chatConversation"("profileId", "updatedAt");

-- CreateIndex
CREATE INDEX "chatMessage_conversationId_createdAt_idx" ON "chatMessage"("conversationId", "createdAt");

-- CreateIndex
CREATE INDEX "waterLog_profileId_localDate_idx" ON "waterLog"("profileId", "localDate");

-- CreateIndex
CREATE INDEX "fastingLog_profileId_localDate_idx" ON "fastingLog"("profileId", "localDate");

-- CreateIndex
CREATE INDEX "reminder_profileId_kind_idx" ON "reminder"("profileId", "kind");

-- CreateIndex
CREATE INDEX "reminder_enabled_nextRunAt_idx" ON "reminder"("enabled", "nextRunAt");

-- CreateIndex
CREATE UNIQUE INDEX "notification_dedupeKey_key" ON "notification"("dedupeKey");

-- CreateIndex
CREATE INDEX "notification_userId_readAt_createdAt_idx" ON "notification"("userId", "readAt", "createdAt");

-- CreateIndex
CREATE INDEX "notificationDelivery_notificationId_idx" ON "notificationDelivery"("notificationId");

-- CreateIndex
CREATE INDEX "notificationDelivery_status_channel_idx" ON "notificationDelivery"("status", "channel");

-- CreateIndex
CREATE INDEX "notificationDelivery_pushDeviceId_idx" ON "notificationDelivery"("pushDeviceId");

-- CreateIndex
CREATE UNIQUE INDEX "pushDevice_expoPushToken_key" ON "pushDevice"("expoPushToken");

-- CreateIndex
CREATE INDEX "pushDevice_userId_revokedAt_idx" ON "pushDevice"("userId", "revokedAt");

-- CreateIndex
CREATE UNIQUE INDEX "referralInvitation_tokenHash_key" ON "referralInvitation"("tokenHash");

-- CreateIndex
CREATE UNIQUE INDEX "referralInvitation_acceptedById_key" ON "referralInvitation"("acceptedById");

-- CreateIndex
CREATE INDEX "referralInvitation_email_status_idx" ON "referralInvitation"("email", "status");

-- CreateIndex
CREATE INDEX "referralInvitation_invitedById_status_idx" ON "referralInvitation"("invitedById", "status");

-- CreateIndex
CREATE INDEX "subscription_userId_currentPeriodEnd_idx" ON "subscription"("userId", "currentPeriodEnd");

-- CreateIndex
CREATE INDEX "subscription_userId_status_idx" ON "subscription"("userId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "subscription_store_storeSubscriptionId_key" ON "subscription"("store", "storeSubscriptionId");

-- CreateIndex
CREATE UNIQUE INDEX "billingEvent_eventId_key" ON "billingEvent"("eventId");

-- CreateIndex
CREATE INDEX "billingEvent_userId_receivedAt_idx" ON "billingEvent"("userId", "receivedAt");

-- CreateIndex
CREATE INDEX "billingEvent_processedAt_receivedAt_idx" ON "billingEvent"("processedAt", "receivedAt");

-- CreateIndex
CREATE UNIQUE INDEX "user_username_key" ON "user"("username");

-- AddForeignKey
ALTER TABLE "nutritionProfile" ADD CONSTRAINT "nutritionProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dietaryRestriction" ADD CONSTRAINT "dietaryRestriction_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "nutritionProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "onboardingSession" ADD CONSTRAINT "onboardingSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "onboardingAnswer" ADD CONSTRAINT "onboardingAnswer_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "onboardingSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nutritionGoal" ADD CONSTRAINT "nutritionGoal_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "nutritionProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "weightLog" ADD CONSTRAINT "weightLog_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "nutritionProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "foodAlias" ADD CONSTRAINT "foodAlias_foodId_fkey" FOREIGN KEY ("foodId") REFERENCES "food"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "foodServing" ADD CONSTRAINT "foodServing_foodId_fkey" FOREIGN KEY ("foodId") REFERENCES "food"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "foodNutrient" ADD CONSTRAINT "foodNutrient_foodId_fkey" FOREIGN KEY ("foodId") REFERENCES "food"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "foodNutrient" ADD CONSTRAINT "foodNutrient_nutrientId_fkey" FOREIGN KEY ("nutrientId") REFERENCES "nutrient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nutrientReference" ADD CONSTRAINT "nutrientReference_nutrientId_fkey" FOREIGN KEY ("nutrientId") REFERENCES "nutrient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "foodPrice" ADD CONSTRAINT "foodPrice_foodId_fkey" FOREIGN KEY ("foodId") REFERENCES "food"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "foodPreference" ADD CONSTRAINT "foodPreference_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "nutritionProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "foodPreference" ADD CONSTRAINT "foodPreference_foodId_fkey" FOREIGN KEY ("foodId") REFERENCES "food"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scanSession" ADD CONSTRAINT "scanSession_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "nutritionProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scan" ADD CONSTRAINT "scan_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "nutritionProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scan" ADD CONSTRAINT "scan_mealLogId_fkey" FOREIGN KEY ("mealLogId") REFERENCES "mealLog"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scan" ADD CONSTRAINT "scan_scanSessionId_fkey" FOREIGN KEY ("scanSessionId") REFERENCES "scanSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mealLog" ADD CONSTRAINT "mealLog_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "nutritionProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mealPhoto" ADD CONSTRAINT "mealPhoto_mealLogId_fkey" FOREIGN KEY ("mealLogId") REFERENCES "mealLog"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mealItem" ADD CONSTRAINT "mealItem_mealLogId_fkey" FOREIGN KEY ("mealLogId") REFERENCES "mealLog"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mealItem" ADD CONSTRAINT "mealItem_foodId_fkey" FOREIGN KEY ("foodId") REFERENCES "food"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mealItem" ADD CONSTRAINT "mealItem_barcodeProductId_fkey" FOREIGN KEY ("barcodeProductId") REFERENCES "barcodeProduct"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "barcodeScan" ADD CONSTRAINT "barcodeScan_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "nutritionProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "barcodeScan" ADD CONSTRAINT "barcodeScan_productId_fkey" FOREIGN KEY ("productId") REFERENCES "barcodeProduct"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dailyNutritionSummary" ADD CONSTRAINT "dailyNutritionSummary_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "nutritionProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "insight" ADD CONSTRAINT "insight_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "nutritionProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mealPlan" ADD CONSTRAINT "mealPlan_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "nutritionProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mealPlanItem" ADD CONSTRAINT "mealPlanItem_planId_fkey" FOREIGN KEY ("planId") REFERENCES "mealPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mealPlanItem" ADD CONSTRAINT "mealPlanItem_foodId_fkey" FOREIGN KEY ("foodId") REFERENCES "food"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pantryItem" ADD CONSTRAINT "pantryItem_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "nutritionProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pantryItem" ADD CONSTRAINT "pantryItem_foodId_fkey" FOREIGN KEY ("foodId") REFERENCES "food"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "groceryList" ADD CONSTRAINT "groceryList_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "nutritionProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "groceryList" ADD CONSTRAINT "groceryList_mealPlanId_fkey" FOREIGN KEY ("mealPlanId") REFERENCES "mealPlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "groceryItem" ADD CONSTRAINT "groceryItem_listId_fkey" FOREIGN KEY ("listId") REFERENCES "groceryList"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "groceryItem" ADD CONSTRAINT "groceryItem_foodId_fkey" FOREIGN KEY ("foodId") REFERENCES "food"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expenseLog" ADD CONSTRAINT "expenseLog_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "nutritionProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chatConversation" ADD CONSTRAINT "chatConversation_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "nutritionProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chatMessage" ADD CONSTRAINT "chatMessage_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "chatConversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "waterLog" ADD CONSTRAINT "waterLog_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "nutritionProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fastingLog" ADD CONSTRAINT "fastingLog_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "nutritionProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reminder" ADD CONSTRAINT "reminder_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "nutritionProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification" ADD CONSTRAINT "notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notificationDelivery" ADD CONSTRAINT "notificationDelivery_notificationId_fkey" FOREIGN KEY ("notificationId") REFERENCES "notification"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notificationDelivery" ADD CONSTRAINT "notificationDelivery_pushDeviceId_fkey" FOREIGN KEY ("pushDeviceId") REFERENCES "pushDevice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pushDevice" ADD CONSTRAINT "pushDevice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notificationPreference" ADD CONSTRAINT "notificationPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referralInvitation" ADD CONSTRAINT "referralInvitation_invitedById_fkey" FOREIGN KEY ("invitedById") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referralInvitation" ADD CONSTRAINT "referralInvitation_acceptedById_fkey" FOREIGN KEY ("acceptedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscription" ADD CONSTRAINT "subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
