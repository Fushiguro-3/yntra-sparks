<script setup>
import { useDocumentHead } from '@/utils/head'

useDocumentHead(
  'Terms & Conditions',
  'The terms that govern use of the Yntra Sparks website and school platform.'
)

const lastUpdated = 'July 21, 2026'
</script>

<template>
  <section class="max-w-[840px] mx-auto px-5 md:px-10 pt-16 pb-24">
    <header class="mb-10" data-aos="fade-up">
      <p class="text-xs font-bold uppercase tracking-[.18em] text-spark-600 mb-2">Legal</p>
      <h1 class="font-display text-3xl md:text-4xl font-bold text-navy-900 mb-3">Terms &amp; Conditions</h1>
      <p class="text-sm text-ink-600">Last updated: {{ lastUpdated }}</p>
    </header>

    <div class="app-surface rounded-[28px] p-6 sm:p-9 space-y-8 text-ink-700 leading-relaxed">
      <section>
        <h2 class="font-display text-xl font-bold text-navy-900 mb-2">1. Acceptance of Terms</h2>
        <p>
          By using the Yntra Sparks website or platform, you agree to these terms. If you're using
          the platform on behalf of a school, you're agreeing on the school's behalf and confirming
          you're authorized to do so.
        </p>
      </section>

      <section>
        <h2 class="font-display text-xl font-bold text-navy-900 mb-2">2. Accounts &amp; Access</h2>
        <p>
          Platform accounts (Super Admin, Principal, Teacher) are created by an administrator —
          there is no public self-registration. You're responsible for keeping your login
          credentials confidential and for all activity under your account. Notify us immediately
          if you suspect unauthorized access.
        </p>
      </section>

      <section>
        <h2 class="font-display text-xl font-bold text-navy-900 mb-2">3. Acceptable Use</h2>
        <p>You agree not to:</p>
        <ul class="list-disc pl-5 space-y-1.5 mt-2">
          <li>Use the platform for any purpose outside supporting your school's use of Yntra Sparks kits.</li>
          <li>Attempt to access data belonging to another school.</li>
          <li>Interfere with or disrupt the operation of the website or platform.</li>
          <li>Reproduce, resell, or redistribute kit content (guides, videos, manuals) outside your school.</li>
        </ul>
      </section>

      <section>
        <h2 class="font-display text-xl font-bold text-navy-900 mb-2">4. Intellectual Property</h2>
        <p>
          All kit content — descriptions, instructional videos, and manuals — is owned by Yntra
          Sparks or licensed to us, and is made available to your school for internal educational
          use only.
        </p>
      </section>

      <section>
        <h2 class="font-display text-xl font-bold text-navy-900 mb-2">5. Kit Availability</h2>
        <p>
          Kit catalog content, grade coverage, and category listings may change over time as we add
          or retire kits. We'll make reasonable efforts to keep active kits and their materials
          accurate and up to date.
        </p>
      </section>

      <section>
        <h2 class="font-display text-xl font-bold text-navy-900 mb-2">6. Limitation of Liability</h2>
        <p>
          The website and platform are provided "as is." To the fullest extent permitted by law,
          Yntra Sparks is not liable for indirect or consequential damages arising from use of the
          site or platform.
        </p>
      </section>

      <section>
        <h2 class="font-display text-xl font-bold text-navy-900 mb-2">7. Termination</h2>
        <p>
          We may suspend or deactivate an account that violates these terms. A school's Super Admin
          may request deactivation of any account belonging to their school at any time.
        </p>
      </section>

      <section>
        <h2 class="font-display text-xl font-bold text-navy-900 mb-2">8. Governing Law</h2>
        <p>These terms are governed by the laws of India, with courts in Karnataka having jurisdiction.</p>
      </section>

      <section>
        <h2 class="font-display text-xl font-bold text-navy-900 mb-2">9. Changes to These Terms</h2>
        <p>
          We may update these terms from time to time. Material changes will be reflected by
          updating the "Last updated" date above.
        </p>
      </section>

      <section>
        <h2 class="font-display text-xl font-bold text-navy-900 mb-2">10. Contact Us</h2>
        <p>
          Questions about these terms can be sent to
          <a href="mailto:yntrasparksofficial@gmail.com" class="text-spark-600 hover:text-spark-700 underline">yntrasparksofficial@gmail.com</a>
          or via our <RouterLink :to="{ name: 'public-contact' }" class="text-spark-600 hover:text-spark-700 underline">Contact page</RouterLink>.
        </p>
      </section>
    </div>
  </section>
</template>
