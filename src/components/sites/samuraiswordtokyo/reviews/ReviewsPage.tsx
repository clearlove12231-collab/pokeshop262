/* eslint-disable @next/next/no-img-element */
import { Fragment } from "react";
import { sourceHref } from "../paths";
import { SiteChrome } from "../SiteChrome";
import { RsStars } from "../stars";
import {
  PER_PAGE,
  SOURCE_GROUP_CHIPS,
  SOURCE_STAR_COUNTS,
  SOURCE_TOTAL,
  TOP_PRODUCTS,
  isFiltered,
  pageItems,
  reviewsHref,
  selectReviews,
  type Review,
  type ReviewQuery,
} from "./query";
import { ReviewLightbox, ReviewSortForm } from "./ReviewsClient";

const fmt = (n: number) => n.toLocaleString("en-US");

function Summary() {
  return (
    <div className="sst-rvp-summary">
      <div className="sst-rvp-summary__avg">
        <span className="sst-rvp-avg-num">4.9</span>
        <RsStars avg={4.9} label="5 중에서 4.9로 평가됨" />
        <span className="sst-rvp-count">리뷰 {fmt(SOURCE_TOTAL)}개 기준</span>
      </div>
      <div className="sst-rvp-bars" aria-label="별점 분포">
        {[5, 4, 3, 2, 1].map((s) => (
          <a key={s} className="sst-rvp-bar-row" rel="nofollow" href={reviewsHref({ stars: s })}>
            <span className="sst-rvp-bar__star">별 {s}개</span>
            <span className="sst-rvp-bar">
              <span className="sst-rvp-bar__fill" style={{ width: `${Math.round((SOURCE_STAR_COUNTS[s] / SOURCE_TOTAL) * 100)}%` }} />
            </span>
            <span className="sst-rvp-bar__n">{fmt(SOURCE_STAR_COUNTS[s])}</span>
          </a>
        ))}
      </div>
      <ul className="sst-rvp-facts">
        <li>사진 있는 리뷰 469개</li>
        <li>리뷰된 상품 252개</li>
      </ul>
    </div>
  );
}

function TopProducts() {
  return (
    <section className="sst-rvp-products">
      <h2 className="sst-rvp-h2">리뷰가 많은 상품</h2>
      <div className="sst-rvp-products__rail">
        {TOP_PRODUCTS.map((p) => (
          <a key={p.url} className="sst-rvp-product-card" href={sourceHref(p.url)}>
            <img src={p.img} width={64} height={64} alt="" loading="lazy" decoding="async" />
            <span className="sst-rvp-product-card__name">{p.name}</span>
            <span className="sst-rvp-product-card__meta">
              <RsStars avg={Number(p.avg ?? 0)} label={`5 중에서 ${p.avg}로 평가됨`} />
              <span className="sst-rvp-product-card__count">{p.count}</span>
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}

function Toolbar({ q, total }: { q: ReviewQuery; total: number }) {
  const allActive = !q.group && !q.photos;
  return (
    <div className="sst-rvp-toolbar">
      <nav className="sst-rvp-chips" aria-label="리뷰">
        <a className={`sst-tag-btn${allActive ? " active" : ""}`} aria-current={allActive || undefined} href={reviewsHref({})}>
          전체 <span className="sst-rvp-chip__n">({fmt(SOURCE_TOTAL)})</span>
        </a>
        {SOURCE_GROUP_CHIPS.map((c) => {
          const active = c.group === "photos" ? Boolean(q.photos) : q.group === c.group;
          const href = c.group === "photos" ? reviewsHref({ photos: true }) : reviewsHref({ group: c.group });
          return (
            <a
              key={c.group}
              className={`sst-tag-btn${c.group === "photos" ? " sst-rvp-chip--photos" : ""}${active ? " active" : ""}`}
              aria-current={active || undefined}
              rel="nofollow"
              href={href}
            >
              {c.label} <span className="sst-rvp-chip__n">({fmt(c.count)})</span>
            </a>
          );
        })}
      </nav>
      <nav className="sst-rvp-chips sst-rvp-chips--stars" aria-label="별점으로 필터">
        <a className={`sst-tag-btn${!q.stars ? " active" : ""}`} rel="nofollow" aria-current={!q.stars || undefined} href={reviewsHref({})}>
          전체 별점
        </a>
        {[5, 4, 3, 2, 1].map((s) => (
          <a
            key={s}
            className={`sst-tag-btn sst-rvp-chip--star${q.stars === s ? " active" : ""}`}
            rel="nofollow"
            aria-current={q.stars === s || undefined}
            href={reviewsHref({ stars: s })}
            aria-label={`별 ${s}개`}
          >
            <span className="sst-rvp-chip__star" aria-hidden="true">
              {s} ★
            </span>{" "}
            <span className="sst-rvp-chip__n">({fmt(SOURCE_STAR_COUNTS[s])})</span>
          </a>
        ))}
      </nav>
      <ReviewSortForm sort={q.sort} />
      <span className="sst-rvp-total woocommerce-result-count">리뷰 {fmt(total)}개</span>
    </div>
  );
}

function ReviewItem({ r, index }: { r: Review; index: number }) {
  const parity = index % 2 === 0 ? "even thread-even" : "odd alt thread-odd thread-alt";
  return (
    <li className={`review byuser ${parity} depth-1`} id={`li-comment-${r.id}`}>
      <div id={`comment-${r.id}`} className="comment_container">
        <div className="comment-text">
          <a className="sst-rvp-product" href={sourceHref(r.product.url)} aria-label="리뷰 대상 상품">
            <img src={r.product.img} width={40} height={40} alt="" loading="lazy" decoding="async" />
            <span className="sst-rvp-product__name">{r.product.name}</span>
            <span className="sst-rvp-product__go">상품 보기 →</span>
          </a>
          {r.also && (
            <p className="sst-rvp-also">
              함께 리뷰한 상품:{" "}
              {r.also.map((a, i) => (
                <Fragment key={a.url}>
                  {i > 0 && ", "}
                  <a href={sourceHref(a.url)}>{a.name}</a>
                </Fragment>
              ))}
            </p>
          )}
          <div className="star-rating" role="img" aria-label={`5 중에서 ${r.rating}로 평가됨`}>
            <span style={{ width: `${(r.rating / 5) * 100}%` }}>
              5 중에서 <strong className="rating">{r.rating}</strong>로 평가됨
            </span>
          </div>{" "}
          <p className="meta">
            <strong className="woocommerce-review__author">{r.author} </strong>{" "}
            {r.verified && <em className="woocommerce-review__verified verified">(인증된 구매자)</em>}{" "}
            <span className="woocommerce-review__dash">–</span>{" "}
            <time className="woocommerce-review__published-date" dateTime={r.datetime}>
              {r.date}
            </time>
          </p>
          <div className="description">
            {r.text.map((t, i) => (
              <p key={i}>
                {t.split("\n").map((line, j) => (
                  <Fragment key={j}>
                    {j > 0 && <br />}
                    {line}
                  </Fragment>
                ))}
              </p>
            ))}
            {r.media && (
              <div className="sst-review-media" role="group" aria-label="이 리뷰의 사진 및 동영상">
                <div className="sst-review-media__grid">
                  {r.media.map((m) => (
                    <button key={m.thumb} type="button" className="sst-review-media__thumb" data-full={m.full}>
                      <img width={150} height={150} src={m.thumb} className="sst-review-media__img" alt="리뷰 사진" loading="lazy" decoding="async" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </li>
  );
}

function Pager({ q, pages }: { q: ReviewQuery; pages: number }) {
  if (pages <= 1) return null;
  const at = (page: number) => reviewsHref({ ...q, page });
  return (
    <nav className="woocommerce-pagination sst-rvp-pager" aria-label={`${q.page} / ${pages} 페이지`}>
      <ul className="page-numbers">
        {q.page > 1 && (
          <li>
            <a className="prev page-numbers" href={at(q.page - 1)}>
              이전
            </a>
          </li>
        )}
        {pageItems(q.page, pages).map((item, i) => (
          <li key={i}>
            {item === "dots" ? (
              <span className="page-numbers dots">…</span>
            ) : item === q.page ? (
              <span aria-current="page" className="page-numbers current">
                {item}
              </span>
            ) : (
              <a className="page-numbers" href={at(item)}>
                {item}
              </a>
            )}
          </li>
        ))}
        {q.page < pages && (
          <li>
            <a className="next page-numbers" href={at(q.page + 1)}>
              다음
            </a>
          </li>
        )}
      </ul>
    </nav>
  );
}

/** /ko/pages/reviews — filters, sort and pages are driven by the URL like the source. */
export function ReviewsPage({ query }: { query: ReviewQuery }) {
  const all = selectReviews(query);
  const pages = Math.max(1, Math.ceil(all.length / PER_PAGE));
  const q = { ...query, page: Math.min(query.page, pages) };
  const shown = all.slice((q.page - 1) * PER_PAGE, q.page * PER_PAGE);
  const total = isFiltered(q) ? all.length : SOURCE_TOTAL;

  return (
    <SiteChrome>
      <main className="sst-main sst-static-main">
        <div className="sst-container">
          <article className="sst-page">
            <nav className="sst-page-breadcrumb" aria-label="브레드크럼">
              <a href="/ko?qo_tab=pokemon">홈</a> <span aria-hidden="true">/</span> <span>고객 리뷰</span>
            </nav>
            <header className="sst-page-header">
              <h1>고객 리뷰</h1>
            </header>
            <div className="sst-page-content">
              <section className="sst-rvp" id="sst-rvp" data-sst-rvp="0.2.0">
                <p className="sst-rvp-intro">
                  이 페이지의 리뷰는 Samurai Sword Tokyo에서 해당 상품을 구매한 고객이 작성했습니다. 개인정보 보호를 위해 이름은 줄여서 표시하며, 사진과 영상은 리뷰 작성자가 공유한 것입니다.
                </p>
                <Summary />
                <div className="sst-review-disclosure">
                  <p className="sst-review-disclosure__main">
                    일부 리뷰는 이용 경험을 공유하고 10포인트(사진이나 동영상을 첨부한 경우 20포인트)를 받은 고객이 작성한 것입니다. 포인트는 별점에 관계없이 모든 리뷰에 동일하게 지급됩니다.
                  </p>
                  <p className="sst-review-disclosure__note">리뷰는 검토 후 게시됩니다.</p>
                </div>
                <TopProducts />
                <Toolbar q={q} total={total} />
                <div className="woocommerce-Reviews sst-rvp-list" id="reviews">
                  <ol className="commentlist">
                    {shown.map((r, i) => (
                      <ReviewItem key={r.id} r={r} index={i} />
                    ))}
                  </ol>
                </div>
                <Pager q={q} pages={pages} />
                <div className="sst-rvp-cta">
                  <h2 className="sst-rvp-h2">카테고리별 쇼핑</h2>
                  <div className="sst-rvp-cta__links">
                    <a className="sst-button sst-button--ghost" href={sourceHref("/ko/collections/pokemon-card-box")}>
                      포켓몬 박스
                    </a>
                    <a className="sst-button sst-button--ghost" href={sourceHref("/ko/collections/psa10-graded-card")}>
                      PSA 10 카드
                    </a>
                    <a className="sst-button sst-button--ghost" href={sourceHref("/ko/collections/one-piece-card-box")}>
                      원피스 박스
                    </a>
                    <a className="sst-button" href={sourceHref("/ko/my-account/orders")}>
                      리뷰 작성
                    </a>
                  </div>
                </div>
              </section>
            </div>
          </article>
        </div>
      </main>
      <ReviewLightbox />
    </SiteChrome>
  );
}
