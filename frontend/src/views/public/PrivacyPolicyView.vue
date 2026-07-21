<script setup>
import { useDocumentHead } from '@/utils/head'

useDocumentHead(
  'Privacy Policy',
  'How Yntra Sparks collects, uses, and protects information from schools, staff, and website visitors.'
)

const lastUpdated = 'July 21, 2026'
</script>

<template>
  <section class="max-w-[840px] mx-auto px-5 md:px-10 pt-16 pb-24">
    <header class="mb-10" data-aos="fade-up">
      <p class="text-xs font-bold uppercase tracking-[.18em] text-spark-600 mb-2">Legal</p>
      <h1 class="font-display text-3xl md:text-4xl font-bold text-navy-900 mb-3">Privacy Policy</h1>
      <p class="text-sm text-ink-600">Last updated: {{ lastUpdated }}</p>
    </header>

    <div class="app-surface rounded-[28px] p-6 sm:p-9 space-y-8 text-ink-700 leading-relaxed">
      <section>
        <h2 class="font-display text-xl font-bold text-navy-900 mb-2">1. Introduction</h2>
        <p>
          Yntra Sparks ("we", "us", "our") provides hands-on STEM learning kits to schools. This
          policy explains what information we collect through
          <span class="font-medium">yntrasparks.com</span> and our school platform, how we use it,
          and the choices you have. It applies to school staff (Super Admin, Principal, and Teacher
          accounts) and to visitors browsing the public site.
        </p>
      </section>

      <section>
        <h2 class="font-display text-xl font-bold text-navy-900 mb-2">2. Information We Collect</h2>
        <ul class="list-disc pl-5 space-y-1.5">
          <li><span class="font-medium text-navy-900">Account information</span> — name, work email, school, and role for accounts created by an administrator (there is no public self-signup).</li>
          <li><span class="font-medium text-navy-900">Contact form submissions</span> — name, email, subject, and message when you write to us.</li>
          <li><span class="font-medium text-navy-900">Newsletter subscription</span> — the email address you provide to subscribe, and your confirmation status.</li>
          <li><span class="font-medium text-navy-900">Usage data</span> — basic technical information (browser, device type) generated automatically by visiting the site.</li>
        </ul>
      </section>

      <section>
        <h2 class="font-display text-xl font-bold text-navy-900 mb-2">3. How We Use Information</h2>
        <p>We use the information above to:</p>
        <ul class="list-disc pl-5 space-y-1.5 mt-2">
          <li>Provide and maintain school accounts and access to kit content.</li>
          <li>Respond to enquiries submitted through the Contact page.</li>
          <li>Send newsletter updates to subscribers who have confirmed their subscription.</li>
          <li>Improve the reliability and usability of the site and platform.</li>
        </ul>
      </section>

      <section>
        <h2 class="font-display text-xl font-bold text-navy-900 mb-2">4. Third-Party Services</h2>
        <p>We rely on a small number of third-party services to operate the public site:</p>
        <ul class="list-disc pl-5 space-y-1.5 mt-2">
          <li><span class="font-medium text-navy-900">Web3Forms</span> — delivers Contact form submissions to our inbox by email. See <a href="https://web3forms.com/privacy" target="_blank" rel="noopener noreferrer" class="text-spark-600 hover:text-spark-700 underline">Web3Forms' privacy policy</a>.</li>
          <li><span class="font-medium text-navy-900">Buttondown</span> — manages newsletter subscriptions and sends confirmation and update emails. See <a href="https://buttondown.com/privacy" target="_blank" rel="noopener noreferrer" class="text-spark-600 hover:text-spark-700 underline">Buttondown's privacy policy</a>.</li>
        </ul>
        <p class="mt-2">We do not sell personal information to third parties.</p>
      </section>

      <section>
        <h2 class="font-display text-xl font-bold text-navy-900 mb-2">5. Cookies &amp; Local Storage</h2>
        <p>
          Signed-in sessions use a secure, httpOnly cookie to keep you logged in — it isn't
          accessible to page scripts. The browser's local storage is used for a small number of
          non-sensitive conveniences, such as remembering that you've already subscribed to the
          newsletter on this device, so you don't see a duplicate confirmation prompt.
        </p>
      </section>

      <section>
        <h2 class="font-display text-xl font-bold text-navy-900 mb-2">6. Data Retention</h2>
        <p>
          Account data is retained for as long as your school's account is active, and is removed
          or anonymized within a reasonable period after deactivation. Contact form messages are
          retained only as long as needed to respond to your enquiry.
        </p>
      </section>

      <section>
        <h2 class="font-display text-xl font-bold text-navy-900 mb-2">7. Children's Privacy</h2>
        <p>
          Yntra Sparks accounts are created by school administrators for staff (Super Admin,
          Principal, and Teacher roles) — students do not create accounts or submit personal
          information directly to the platform.
        </p>
      </section>

      <section>
        <h2 class="font-display text-xl font-bold text-navy-900 mb-2">8. Your Rights</h2>
        <p>
          You may ask to access, correct, or delete personal information we hold about you, and you
          can unsubscribe from the newsletter at any time using the link in any email you receive.
          To make a request, use the details on our <RouterLink :to="{ name: 'public-contact' }" class="text-spark-600 hover:text-spark-700 underline">Contact page</RouterLink>.
        </p>
      </section>

      <section>
        <h2 class="font-display text-xl font-bold text-navy-900 mb-2">9. Changes to This Policy</h2>
        <p>
          We may update this policy from time to time. Material changes will be reflected by
          updating the "Last updated" date above.
        </p>
      </section>

      <section>
        <h2 class="font-display text-xl font-bold text-navy-900 mb-2">10. Contact Us</h2>
        <p>
          Questions about this policy can be sent to
          <a href="mailto:yntrasparksofficial@gmail.com" class="text-spark-600 hover:text-spark-700 underline">yntrasparksofficial@gmail.com</a>
          or via our <RouterLink :to="{ name: 'public-contact' }" class="text-spark-600 hover:text-spark-700 underline">Contact page</RouterLink>.
        </p>
      </section>
    </div>
  </section>
</template>
