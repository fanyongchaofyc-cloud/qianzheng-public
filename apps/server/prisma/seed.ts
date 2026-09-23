import { PrismaClient, VisaCategoryCode } from '@prisma/client'

const prisma = new PrismaClient()

const text = (zh: string, en: string, ja: string, ko: string) => ({
  'zh-CN': zh,
  en,
  ja,
  ko
})

async function main () {
  const japan = await prisma.destination.upsert({
    where: { code: 'japan' },
    update: {},
    create: {
      code: 'japan',
      name: text('日本', 'Japan', '日本', '일본'),
      region: 'asia'
    }
  })

  const category = await prisma.visaCategory.upsert({
    where: { destinationId_code: { destinationId: japan.id, code: VisaCategoryCode.tourist } },
    update: {},
    create: {
      destinationId: japan.id,
      code: VisaCategoryCode.tourist,
      name: text('旅游签证', 'Tourist Visa', '観光ビザ', '관광 비자')
    }
  })

  const passport = await prisma.requirementItem.upsert({
    where: { code: 'japan_tourist_passport' },
    update: {},
    create: {
      code: 'japan_tourist_passport',
      name: text('护照原件', 'Original passport', 'パスポート原本', '여권 원본'),
      description: text('有效期 6 个月以上，且有空白页。', 'Valid for at least 6 months with blank pages.', '有効期限が6か月以上あり、余白ページがあること。', '유효기간 6개월 이상, 빈 페이지 필요.')
    }
  })

  const photo = await prisma.requirementItem.upsert({
    where: { code: 'japan_tourist_photo' },
    update: {},
    create: {
      code: 'japan_tourist_photo',
      name: text('签证照片', 'Visa photo', 'ビザ用写真', '비자 사진'),
      description: text('近 6 个月白底彩色照片。', 'Color photo with white background taken within 6 months.', '6か月以内に撮影した白背景のカラー写真。', '6개월 이내 촬영한 흰색 배경 컬러 사진.')
    }
  })

  const form = await prisma.requirementItem.upsert({
    where: { code: 'japan_tourist_form' },
    update: {},
    create: {
      code: 'japan_tourist_form',
      name: text('签证申请表', 'Visa application form', '査証申請書', '비자 신청서'),
      description: text('按使领馆要求如实填写。', 'Complete truthfully per the consulate requirements.', '領事館の要件に従って正確に記入する。', '영사관 요구사항에 따라 정확히 작성.')
    }
  })

  const funds = await prisma.requirementItem.upsert({
    where: { code: 'japan_tourist_funds' },
    update: {},
    create: {
      code: 'japan_tourist_funds',
      name: text('经济能力证明', 'Proof of financial capacity', '経済力の証明', '경제 능력 증명'),
      description: text('银行流水或存款证明。', 'Bank statements or deposit certificate.', '銀行取引明細または預金証明書。', '은행 거래 내역 또는 예금 증명.')
    }
  })

  await prisma.scenario.create({
    data: {
      visaCategoryId: category.id,
      code: 'default_tourist',
      name: text('普通旅游签证', 'Standard tourist visa', '一般観光ビザ', '일반 관광 비자'),
      requirements: {
        create: [
          { requirementItemId: passport.id, required: true, quantity: 1, sortOrder: 1 },
          { requirementItemId: photo.id, required: true, quantity: 2, sortOrder: 2 },
          { requirementItemId: form.id, required: true, quantity: 1, sortOrder: 3 },
          { requirementItemId: funds.id, required: true, quantity: 1, sortOrder: 4 }
        ]
      },
      steps: {
        create: [
          {
            processStep: {
              create: { code: 'japan_tourist_fill_form', title: text('填写申请表', 'Complete application form', '申請書を記入する', '신청서 작성') }
            },
            sortOrder: 1,
            estimatedDays: 1
          },
          {
            processStep: {
              create: { code: 'japan_tourist_submit', title: text('递交材料', 'Submit documents', '書類を提出する', '서류 제출') }
            },
            sortOrder: 2,
            estimatedDays: 1
          },
          {
            processStep: {
              create: { code: 'japan_tourist_collect', title: text('领取护照', 'Collect passport', 'パスポートを受け取る', '여권 수령') }
            },
            sortOrder: 3,
            estimatedDays: 5
          }
        ]
      }
    }
  })

  await prisma.policyVersion.create({
    data: {
      destinationId: japan.id,
      visaCategoryId: category.id,
      version: '2026.09.01',
      status: 'draft',
      effectiveAt: new Date('2026-09-01T00:00:00Z'),
      notes: '示例数据，待官方复核'
    }
  })
}

main()
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
