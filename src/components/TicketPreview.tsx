import { QRCodeSVG } from "qrcode.react";
import logo from "../../src/newLogo.png";
import { formatTimestamp } from "../utils";
import { useAppSelector } from "../redux/store";

const TicketPreview = ({ activeIndex }: { activeIndex: number }) => {
  const { driverInfo, sessionInfo } = useAppSelector(({ app }) => app);

  return (
    <div id="content-to-print">
      <div className="flex justify-around text-sm mb-6">
        <div className="flex flex-col justify-between w-[60%] pt-2 pb-4">
          <div>
            <p>City Park Authority</p>
            <p>1728 NE Miami Gardens Dr 405</p>
            <p>Miami, FL 33179</p>
          </div>
          <div>
            <p>{driverInfo?.name || "-"}</p>
            <p>{driverInfo?.address || "-"}</p>
            <p>{`${driverInfo?.city || "-"}, ${driverInfo?.state || "-"} ${
              driverInfo?.zip || "-"
            }`}</p>
          </div>
        </div>
        <div className="flex flex-col w-[60%]">
          <div className="flex items-center justify-center mb-8">
            <p
              className="text-2xl font-bold text-blue-800 tracking-normal uppercase relative"
              style={{
                fontFamily: "'Georgia', serif", // Using Georgia for a more traditional feel
                letterSpacing: "0.05em", // Adjust letter spacing
                textShadow: `
              1px 1px 3px rgba(0, 0, 0, 0.5), 
              2px 2px 5px rgba(0, 0, 0, 0.3)
            `, // Adjusted shadow for a subtle depth
              }}
            >
              City Park Authority
            </p>

            <div style={{ width: 10 }}></div>
          </div>
          <div className="flex flex-col mb-1">
            <div className="flex">
              <div className="flex flex-col border-solid border-2 border-gray-500 px-2 pt-0.5 pb-2 border-b-0 border-r-0 w-[65%]">
                <p className="text-xs text-slate-500 font-semibold">NAME</p>
                <p>{driverInfo?.name || "-"}</p>
              </div>

              <div className="flex flex-col border-solid border-2 border-gray-500 px-2 pt-0.5 pb-2 border-b-0 w-[35%]">
                <p className="text-xs font-semibold text-red-500">AMOUNT DUE</p>
                <p className="flex-grow flex items-center">
                  ${sessionInfo?.fine}
                </p>
              </div>
            </div>
            <div className="flex">
              <div className="flex flex-col border-solid border-2 border-gray-500 px-2 pt-0.5 pb-2 border-b-0 border-r-0 w-[65%]">
                <p className="text-xs text-slate-500 font-semibold">
                  NOTICE TYPE
                </p>
                <p>{sessionInfo?.status}</p>
              </div>
              <div className="flex border-solid border-2 border-gray-500 px-2 pt-0.5 pb-2 border-b-0 flex-col w-[35%]">
                <p className="text-xs text-slate-500 font-semibold">
                  NOTICE NUMBER
                </p>
                <p>{sessionInfo?.noticeNumber}</p>
              </div>
            </div>

            <div className="flex">
              <div className="flex border-solid border-2 border-gray-500 px-2 border-r-0 border-b-0 w-[65%]">
                <div className="flex-col w-[50%] border-solid border-2 border-gray-500 border-l-0 border-y-0 py-0.5">
                  <p className="text-xs text-slate-500 font-semibold">PLATE</p>
                  <p>{sessionInfo?.plateNumber || "-"}</p>
                </div>

                <div className="flex-col w-[50%] px-2 pt-0.5 pb-2">
                  <p className="text-xs text-slate-500 font-semibold">STATE</p>
                  <p>{driverInfo?.state || "-"}</p>
                </div>
              </div>

              <div className="flex border-solid border-2 border-gray-500 px-2 pt-0.5 pb-2 border-b-0 flex-col w-[35%]">
                <p className="text-xs text-slate-500 font-semibold">
                  NOTICE DATE
                </p>
                <p>{formatTimestamp()}</p>
              </div>
            </div>
            <div className="flex">
              <div className="flex flex-col border-solid border-2 border-gray-500 px-2 pt-0.5 pb-2 border-r-0 w-[65%]">
                <p className="text-xs text-slate-500 font-semibold">
                  ENTRY TIME
                </p>
                <p>{formatTimestamp(sessionInfo?.entryTime)}</p>
              </div>

              <div className="flex border-solid border-2 border-gray-500 px-2 pt-0.5 pb-2 flex-col w-[35%]">
                <p className="text-xs text-slate-500 font-semibold">
                  EXIT TIME
                </p>
                <p>{formatTimestamp(sessionInfo?.exitTime)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col mt-10">
        <div className="flex text-3xl font-bold">
          {/* <span className="bg-red-600 text-white">PARKING CHARGE NOTICE</span> */}
          <div className="flex w-[25%] place-content-center">
            <img src={logo} alt="CPMLogo" className="w-32" />
          </div>
          {activeIndex === 3 ? (
            <div className="flex flex-col text-center justify-center w-[50%]">
              <span className="text-red-600">PARKING CHARGE NOTICE</span>
              <p className="text-red-600">DO NOT IGNORE</p>
            </div>
          ) : activeIndex === 0 || activeIndex === 1 ? (
            <div className="flex flex-col text-center justify-center w-[50%]">
              <span className="text-red-600">PARKING CHARGE NOTICE</span>
              <p className="text-red-600">REMINDER</p>
            </div>
          ) : activeIndex === 2 ? (
            <div className="flex flex-col text-center justify-center w-[50%]">
              <span className="text-red-600">PARKING CHARGE</span>
              <p className="text-red-600">FINAL NOTICE</p>
            </div>
          ) : (
            ""
          )}
          {/* <div className="flex flex-col text-center justify-center w-[50%]">
            <span className="text-red-600">PARKING CHARGE NOTICE</span>
            <p className="text-red-600">DO NOT IGNORE</p>{" "}
          </div> */}
          <div className="flex w-[25%] justify-end">
            <div className="border-solid border-2 border-black p-1 rounded-md">
              <QRCodeSVG value={"https://ppnotice.com/"} size={73} />
            </div>
            <p className="text-lg text-black font-semibold pl-3 text-center justify-center content-center leading-6 size-min place-self-center">
              PAY CHARGE
            </p>
          </div>
        </div>
        <div className="mt-2 text-base">
          {/* <span>
            This vehicle parked at {previewData.lot.address} has an outstanding
            balance. In accordance with the terms and conditions of the Parking
            Contract clearyl displayed at the parking facility, the sum of $
            {fine} plus any applicable state sales tax and/or parking surcharge
            is due.
            <br />
          </span> */}
          <span>
            This is a parking payment notice for failure to pay for parking at{" "}
            {sessionInfo?.lot.address} monitored by City Park Authority. By
            parking at the parking facility, you have agreed to the Parking
            Agreeent and the terms and conditions clearly displayed at the
            parking facility. You have an outstanding balance of $
            {sessionInfo?.fine}, plus any applicable state sales tax and/or
            parking surcharges.
            <span className="font-bold text-red-500">
              &nbsp;If you fail to pay within the 15 days, then you are
              responsible to pay the full amount of the Parking Charge up to a
              maximum amount of $125.
            </span>
            <br />
          </span>
          {/* <span className="font-bold">
            THIS NOTICE IS PRIVATELY ISSUED BY CITY PARK AUTHORITY ON BEHALF OF
            THE OWNER. IT IS NOT ISSUED BY A GOVERNMENTAL AUTHORITY, AND IS NOT
            SUBJECT TO CIVIL OR CRIMINAL PENALTIES. HOWEVER, FAILURE TO MAKE THE
            PAYMENT MAY RESULT IN REFERRING TO COLLECTIONS, ARBITRATION, OR
            FURTHER LEGAL ACTION.
            <br />
          </span> */}

          <p className="font-bold text-red-500 mt-2">
            FAILURE TO PAY THIS PARKING CHARGE NOTICE MAY RESULT IN THIS MATTER
            BEING REFERRED TO COLLECTIONS.
          </p>
          <p>
            To make your payment, please visit our secure website
            <span className="font-bold"> ppnotice.com</span>. You may also pay
            through our automated payment line (954) 420-1580, or by mailing a
            check to City Park Authority 1728 NE Miami Gardens Dr 405, Miami, FL
            33179. You will be charged a ${sessionInfo?.lot.violationFee}{" "}
            convenience fee for all online and telephone payments.
          </p>
        </div>
      </div>
      <div className="flex justify-center gap-10 w-full mt-1">
        <div className="flex flex-col justify-center items-center">
          <p className="font-bold">ENTRY</p>
          <p className="text-sm">{formatTimestamp(sessionInfo?.entryTime)}</p>
          <img id="vehicle_1" className="mt-2" width={300} />
          <img id="plate_1" className="mt-2" width={80} />
        </div>
        {sessionInfo?.exitTime && (
          <div className="flex flex-col justify-center items-center">
            <p className="font-bold">EXIT</p>

            <p className="text-sm">{formatTimestamp(sessionInfo?.exitTime)}</p>
            <img id="vehicle_2" className="mt-2" width={300} />
            <img id="plate_2" className="mt-1" width={80} />
          </div>
        )}
      </div>

      <div className="mt-1 font-bold text-xs">
        Important: This notice is an attempt to collect a debt, and any
        information obtained will be used for that purpose. You have the right
        to dispute the debt. Disputes can be made online at
        cityparkauthority.com. If you have already sent payment, please
        disregard this notice.
      </div>
      <div className="mt-2 font-bold text-xs">
        THIS NOTICE IS PRIVATELY ISSUED, IT IS NOT ISSUED BY A GOVERNMENTAL
        AUTHORITY, AND IS NOT SUBJECT TO CIVIL OR CRIMINAL PENALTIES. HOWEVER,
        FAILURE TO MAKE THE PAYMENT MAY RESULT IN REFERRING TO COLLECTIONS,
        ARBITRATION, OR FURTHER LEGAL ACTION.
      </div>
    </div>
  );
};

export default TicketPreview;
